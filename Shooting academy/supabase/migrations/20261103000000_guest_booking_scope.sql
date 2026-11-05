-- ============================================================
-- 2026-11-03 — Phase 5: Guest booking scope (VUL-008)
--
-- Closes the remaining Pay & Play booking gap: the Phase 2 trigger
-- (enforce_guest_booking_state, migration 20261024210000) verified
-- only that the referenced session EXISTS and is where the
-- authoritative price comes from. It did not reject sessions that
-- are hidden (is_visible = false) or not bookable
-- (availability_status != 'available').
--
-- Attack scenario (before this migration):
--   anon knows a hidden/unavailable session's UUID (e.g. captured
--   while it was listed, or from an older link) and POSTs a booking
--   referencing it. Phase policy checks on state columns pass and
--   the insert succeeds — bookings against sessions the academy
--   has deliberately taken off sale.
--
-- Fix (this migration only; guest inserts are unaffected otherwise):
--   1. enforce_guest_booking_state() additionally requires
--      is_visible = true AND availability_status = 'available'
--      for NON-ADMIN inserts. Admin inserts skip all guest checks
--      exactly as before.
--   2. The public READ policy for session details is already scoped
--      in the initial schema ("Public read pay play options"
--      USING (is_visible = true)), so hidden sessions are not
--      readable via the anon dat API either. Verified during the
--      2026-10 security audit; no change needed.
--
-- Client counterpart (same audit): PayPlaySessionPage now renders
-- "not available for booking" instead of the form for such
-- sessions — UX only; this database trigger remains the boundary.
--
-- Idempotent and reversible: re-running produces the same state.
-- Rollback = re-create the function body from migration
-- 20261024210000_public_insert_scope_hardening.sql (bookings of
-- hidden sessions become possible again; not recommended).
--
-- Review status: reviewed SQL only — NOT executed against any
-- live database (local-only audit policy).
-- ============================================================

-- ------------------------------------------------------------
-- Ensure the availability_status column exists before the trigger
-- references it (belt-and-braces for projects where the tracked
-- 20251011000000_pay_play_enhancements migration has not run).
-- ------------------------------------------------------------
DO $$
DECLARE
  v_has_availability boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'pay_play_options'
      AND column_name  = 'availability_status'
  ) INTO v_has_availability;

  IF NOT v_has_availability THEN
    RAISE NOTICE 'availability_status missing on pay_play_options — adding it (matches 20251011000000)';
    ALTER TABLE public.pay_play_options
      ADD COLUMN availability_status TEXT DEFAULT 'available'
      CHECK (availability_status IN ('available', 'unavailable', 'temporarily_closed'));
  END IF;
END $$;

-- ------------------------------------------------------------
-- 1. Recreate the guest-state trigger with the scope check.
--    (CREATE OR REPLACE keeps semantics of the Phase 2 version and
--    adds the session-visibility gate to the pricing lookup.)
-- ------------------------------------------------------------
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

    -- Authoritative pricing AND scope: the amount is always the
    -- referenced session's price, and only sessions that are
    -- currently visible AND marked available may be booked.
    -- (Admin-specific INSERT policies operate under
    -- is_active_admin() and never reach these rewrites.)
    SELECT po.price_amount INTO v_price
    FROM public.pay_play_options po
    WHERE po.id = NEW.session_id
      AND po.is_visible = true
      AND po.availability_status = 'available';

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

-- Trigger itself is unchanged (Phase 2 created it); ensure it exists
-- and is bound, regardless of applied order.
DROP TRIGGER IF EXISTS enforce_guest_booking_state ON public.pay_play_bookings;
CREATE TRIGGER enforce_guest_booking_state
  BEFORE INSERT ON public.pay_play_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_guest_booking_state();

-- ------------------------------------------------------------
-- 2. Post-apply verification probes (run in Studio SQL editor with
--    the anon role, or via PostgREST with the anon key):
--
--    A. Hidden session cannot be booked:
--       UPDATE pay_play_options SET is_visible = false
--         WHERE id = '<test-session-id>';   -- use a scratch session
--       POST /rest/v1/pay_play_bookings  body:
--         {"full_name":"probe","phone":"9999999999",
--          "email":"p@e.com","session_id":"<test-session-id>"}
--         → 500/400 (exception "selected session is not available")
--       UPDATE pay_play_options SET is_visible = true ...
--
--    B. Unavailable session cannot be booked (availability look-ups
--       apply to 'unavailable' and 'temporarily_closed' identically):
--       UPDATE pay_play_options SET availability_status = 'unavailable'
--         WHERE id = '<test-session-id>';
--       → same 403/blocked result; restore to 'available' afterwards.
--
--    C. Available session still books (admin clears the probe row):
--       → 201, amount = price_amount, payment/booking status pending.
--
--    D. Admin insert is not affected:
--       authenticated admin INSERT against a hidden session
--       succeeds (trigger skips guest rules for active admins).
-- ------------------------------------------------------------
