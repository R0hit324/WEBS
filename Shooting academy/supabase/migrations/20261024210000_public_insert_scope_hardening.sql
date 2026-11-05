-- ============================================================
-- 2026-10-24 — Phase 2: Public INSERT scope hardening (VUL-003)
--
-- Targets the two remaining guest-writable tables whose anon INSERT
-- policies are still fully permissive:
--
--   registrations        "Public insert registrations"  WITH CHECK (true)
--   pay_play_bookings    "Public insert pay play bookings" WITH CHECK (true)
--
-- A guest could POST any column they liked (e.g. status='completed',
-- admin_notes, payment fields, a 0/tampered amount) and PostgREST
-- would happily insert it. With RLS returning zero anon rows, the
-- tampering was invisible without an admin seat, but the data could
-- be poisoned before an admin ever looked at it.
--
-- Also REPAIRS a production outage found while auditing VUL-003:
-- the Pay & Play booking form posts city, experience_level,
-- preferred_date, preferred_time and message — none of which exist
-- in the tracked schema. Every guest booking submit has been failing
-- with 400 (PGRST204) since launch. The columns are added here
-- (IF NOT EXISTS, matching the live frontend payload).
--
-- Frontend compatibility (verified against the live payloads):
--   RegistrationPage.js  sends full_name, age, phone, email, city,
--                        interested_range, experience, message,
--                        status:'new', source:'website'
--   PayPlaySessionPage   sends full_name, phone, email, city,
--                        experience_level, session_id, amount,
--                        preferred_date, preferred_time, message,
--                        booking_status:'pending'
--
-- Safe to re-run (all statements guarded).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Schema repair — columns the live frontend actually posts.
--    (No-ops where prod already has them.)
-- ------------------------------------------------------------
ALTER TABLE public.pay_play_bookings
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS experience_level TEXT,
  ADD COLUMN IF NOT EXISTS preferred_date DATE,
  ADD COLUMN IF NOT EXISTS preferred_time TIME,
  ADD COLUMN IF NOT EXISTS message TEXT;

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS experience TEXT;

COMMENT ON COLUMN public.pay_play_bookings.preferred_date IS 'Guest-requested date (preference); admins schedule the actual slot via booking_date';
COMMENT ON COLUMN public.pay_play_bookings.preferred_time IS 'Guest-requested time (preference); admins schedule the actual slot via booking_time';

-- ------------------------------------------------------------
-- 2. Length guards for guest-supplied text (last line of defence;
--    form enforces client-side, database enforces always).
--    Added NOT VALID so pre-existing rows can never fail the
--    migration; a best-effort VALIDATE checks old rows below.
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'registrations_full_name_len') THEN
    ALTER TABLE public.registrations ADD CONSTRAINT registrations_full_name_len
      CHECK (full_name IS NULL OR char_length(full_name) <= 120) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'registrations_email_len') THEN
    ALTER TABLE public.registrations ADD CONSTRAINT registrations_email_len
      CHECK (char_length(email) <= 160) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'registrations_message_len') THEN
    ALTER TABLE public.registrations ADD CONSTRAINT registrations_message_len
      CHECK (message IS NULL OR char_length(message) <= 2000) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_full_name_len') THEN
    ALTER TABLE public.pay_play_bookings ADD CONSTRAINT bookings_full_name_len
      CHECK (full_name IS NULL OR char_length(full_name) <= 120) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_email_len') THEN
    ALTER TABLE public.pay_play_bookings ADD CONSTRAINT bookings_email_len
      CHECK (char_length(email) <= 160) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_phone_len') THEN
    ALTER TABLE public.pay_play_bookings ADD CONSTRAINT bookings_phone_len
      CHECK (char_length(phone) <= 24) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_message_len') THEN
    ALTER TABLE public.pay_play_bookings ADD CONSTRAINT bookings_message_len
      CHECK (message IS NULL OR char_length(message) <= 1000) NOT VALID;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 3. Defence in depth — before-insert triggers lock guest rows to
--    the pending/default state and clear admin/payment-controlled
--    fields, exactly mirroring the guest-review pattern from
--    20261023120000_public_review_submissions.sql.
--    Active admins (is_active_admin()) bypass enforcement so the
--    admin panel keeps full freedom.
--    Precheck: the helpers below require the admin role enforcement
--    migrations (20261023150000 / ..._v2) to have been applied.
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'is_active_admin' AND pronamespace = 'public'::regnamespace
  ) THEN
    RAISE EXCEPTION 'public.is_active_admin() not found — apply the admin role enforcement migrations first';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.enforce_guest_registration_state()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_active_admin() THEN
    NEW.status      = 'new';          -- guests never set lifecycle status
    NEW.admin_notes = NULL;           -- guests never write admin notes
    NEW.full_name   = TRIM(NEW.full_name);
    NEW.email       = TRIM(NEW.email);
    IF NEW.message IS NOT NULL THEN
      NEW.message = TRIM(NEW.message);
    END IF;
    IF NEW.source IS NULL THEN
      NEW.source = 'website';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_guest_registration_state ON public.registrations;
CREATE TRIGGER enforce_guest_registration_state
  BEFORE INSERT ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_guest_registration_state();

CREATE OR REPLACE FUNCTION public.enforce_guest_booking_state()
RETURNS TRIGGER AS $$
DECLARE
  v_price INTEGER;
BEGIN
  IF NOT public.is_active_admin() THEN
    -- Guests may never set payment or lifecycle columns.
    NEW.payment_status    = 'pending';
    NEW.booking_status    = 'pending';
    NEW.payment_reference = NULL;
    NEW.payment_order_id  = NULL;
    NEW.payment_id        = NULL;

    -- Authoritative pricing: the amount is always what the referenced
    -- session charges, never what the client claims.
    SELECT po.price_amount INTO v_price
    FROM public.pay_play_options po
    WHERE po.id = NEW.session_id;
    IF v_price IS NULL THEN
      RAISE EXCEPTION 'Booking rejected: the selected session is not available';
    END IF;
    NEW.amount = v_price;

    NEW.full_name = TRIM(NEW.full_name);
    NEW.email     = TRIM(NEW.email);
    NEW.phone     = TRIM(NEW.phone);
    IF NEW.message IS NOT NULL THEN
      NEW.message = TRIM(NEW.message);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_guest_booking_state ON public.pay_play_bookings;
CREATE TRIGGER enforce_guest_booking_state
  BEFORE INSERT ON public.pay_play_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_guest_booking_state();

-- ------------------------------------------------------------
-- 4. RLS: replace the unscoped policies. Each anon insert must now
--    land in its pending/default state with no admin-only columns
--    (the WITH CHECK runs on the post-trigger row, so the
--    trigger above and the policy agree).
--    Reads, updates and deletes remain admin-only.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Public insert registrations" ON public.registrations;

CREATE POLICY "Public insert guest registrations"
  ON public.registrations
  FOR INSERT
  TO anon
  WITH CHECK (
    status = 'new'
    AND admin_notes IS NULL
  );

DROP POLICY IF EXISTS "Public insert pay play bookings" ON public.pay_play_bookings;

CREATE POLICY "Public insert guest bookings"
  ON public.pay_play_bookings
  FOR INSERT
  TO anon
  WITH CHECK (
    booking_status = 'pending'
    AND payment_status = 'pending'
    AND payment_reference IS NULL
    AND payment_order_id IS NULL
    AND payment_id IS NULL
  );

-- ------------------------------------------------------------
-- 5. Best-effort validation of pre-existing rows (mirrors the
--    review migration; never aborts the migration itself).
-- ------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.registrations VALIDATE CONSTRAINT registrations_full_name_len;
    ALTER TABLE public.registrations VALIDATE CONSTRAINT registrations_email_len;
    ALTER TABLE public.registrations VALIDATE CONSTRAINT registrations_message_len;
    ALTER TABLE public.pay_play_bookings VALIDATE CONSTRAINT bookings_full_name_len;
    ALTER TABLE public.pay_play_bookings VALIDATE CONSTRAINT bookings_email_len;
    ALTER TABLE public.pay_play_bookings VALIDATE CONSTRAINT bookings_phone_len;
    ALTER TABLE public.pay_play_bookings VALIDATE CONSTRAINT bookings_message_len;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'VALIDATE skipped (check oversized legacy rows manually): %', SQLERRM;
  END;
END $$;

-- ------------------------------------------------------------
-- NOTES
--  * Policies are scoped TO anon, so authenticated legit admins keep
--    the existing "Admin full access" policies and are unaffected.
--  * The with-check runs AFTER the before-insert triggers, so both
--    the trigger and the policy enforce the same invariants.
--  * Guests still cannot read rows (no anon SELECT policy on either
--    table) and have no UPDATE/DELETE rights — values they tamper
--    with are simply ignored or fail the insert.
--  * Post-apply probes to confirm (anon key, no auth):
--      POST /rest/v1/registrations               body
--        {"full_name":"probe","email":"p@e.com","status":"completed"}  → 400
--        {"full_name":"probe","email":"p@e.com"}                       → 201
--      POST /rest/v1/pay_play_bookings           body
--        {...,"booking_status":"confirmed"}                            → 400
--        {...,"booking_status":"pending","amount":999999}              → 201
--          (amount stored = the session's authoritative price)
--    If a 201 probe is created, delete it via the admin panel or SQL.
-- ------------------------------------------------------------
