-- ============================================================
-- 2026-11-04 — Security hardening pass: guest state triggers and
-- RLS policies (forward repair for a partially-applied chain)
--
-- LIVE STATE CONFIRMED BY READ-ONLY AUDIT (2026-11-04):
--   * Migration 20251007000000 (initial schema) IS applied.
--   * Migrations 20261024210000 (7), 20261103000000 (11) and
--     20261103100000 (12) are NOT applied:
--       - enforce_guest_review_state            EXISTS  (migration 1)
--       - enforce_guest_registration_state      MISSING (migration 7)
--       - enforce_guest_booking_state           MISSING (migration 7/11)
--   * registrations / pay_play_bookings still carry the initial
--     unscoped INSERT policies:
--       "Public insert registrations"       WITH CHECK (true)
--       "Public insert pay play bookings"   WITH CHECK (true)
--     (created without a TO clause, so they target PUBLIC — anon
--     evaluates them.)
--
-- WHAT THIS MIGRATION DOES (self-contained; safe whether or not
-- the intermediate migrations ever ran):
--   1. Fail-closed sanity gates (missing objects abort the run).
--   2. Hardens the RLS helpers is_active_admin()/can_admin_write()
--      with a locked search_path and fully qualified references,
--      and grants EXECUTE to the roles that evaluate policies
--      (legacy policies have no TO clause, so anon evaluates them).
--   3. Repairs the missing guest-facing columns the live frontend
--     posts (registrations.experience; five booking columns).
--   4. Adds NOT VALID length guards for guest-supplied text.
--   5. Creates the missing guest-state BEFORE INSERT triggers:
--      registrations (status/admin_notes/source locked) and
--      pay_play_bookings (payment/lifecycle fields locked, amount
--      always the authoritative session price, hidden or closed
--      sessions rejected). The migration-12 review trigger is
--      RECREATED (5d): its body queried admin_users directly as
--      SECURITY INVOKER, which breaks every anon review submission
--      once migration 14 revokes anon SELECT on admin_users — the
--      sanitization semantics are preserved verbatim, routed
--      through can_admin_write() instead (so an active viewer is
--      sanitized as a guest, not treated as an administrator).
--   6. Replaces the unscoped public INSERT policies with scoped
--     policies. A dynamic sweep drops ANY INSERT policy on
--     registrations, pay_play_bookings AND reviews whose role
--     list includes anon, public OR authenticated, so re-runs,
--     dashboard-created stray policies and partially-applied
--     states converge cleanly. Four canonical policies are then
--     recreated: the three anon guest policies, plus an
--     authenticated pending-review policy (the review form uses
--     supabase-js and may carry an authenticated JWT — without it
--     a logged-in non-admin's submission would be denied).
--   6b/6c. Replaces the legacy "Admin full access <t>" FOR ALL
--     policies, which reference admin_users DIRECTLY in their
--     expressions. Permissive policies are OR'd together and the
--     executor permission-checks every relation in a planned
--     statement — including policy subqueries — so once migration
--     14 revokes anon SELECT on admin_users, EVERY anon statement
--     on an affected table fails (confirmed on PG15: guest
--     submissions, the public review wall AND every content-table
--     read whose public-read policy is not constant true, i.e. all
--     of them except site_section_settings). Guest tables get a
--     deterministic sweep + the migrations-2/6 "Admin select <t>"
--     (FOR SELECT via is_active_admin()) / "Admin write <t>" (FOR
--     ALL via can_admin_write()) pair — SECURITY DEFINER, no
--     caller-evaluated admin_users reference remains, AND the
--     agreed role model is enforced at policy level: admin/editor
--     read+write, viewer read-only (B-1 fix; a single
--     is_active_admin() FOR ALL policy would have granted viewers
--     write). The ten content tables get the same pair
--     CONDITIONALLY, only where the legacy policy survives, so
--     migration-2 "Admin select/write" role splits are never
--     weakened.
--   7. Rebuilds admin_users RLS: EVERY existing policy is removed
--     (including dashboard-created ones such as "Admins can read
--     their own record" that target authenticated — a roles-filtered
--     sweep would miss them), then exactly ONE policy is recreated:
--     an own-row SELECT for active authenticated admins. No API role
--     can insert/update/delete admin_users — admin management
--     happens through the Supabase dashboard (postgres/service_role).
--   8. Confirms RLS is enabled on all five audited tables.
--   9. Self-verifies the final policy inventory and aborts if it
--     deviates from the intended state (one admin_users policy;
--     exact guest-table inventories incl. the Admin select/write
--     pairs; NO policy on any audited table referencing
--     admin_users directly) — structurally (exact
--     name/table/command/roles/permissive/USING) AND semantically
--     (every WITH CHECK evaluated against canonical + forged rows).
--
-- NOT done here (by design): privilege revokes. Table- and
-- column-level GRANTs are repaired by the follow-up migration
-- 20261104100000_least_privilege_grants.sql, which must run AFTER
-- this one.
--
-- Idempotent: every statement is guarded or a no-op on re-run.
-- No records are deleted or modified.
--
-- Transaction safety: the Supabase SQL Editor and `supabase db push`
-- each run this file inside a SINGLE transaction — any failure
-- (including the self-verification below) rolls the whole file back,
-- so a failed apply can never leave a half-hardened state.
--
-- Review status: reviewed SQL only — NOT executed against any
-- live database (local-only audit policy).
-- ============================================================

-- ------------------------------------------------------------
-- 0. Fail-closed sanity gates. If the project does not look like
--    the audited one, abort loudly instead of half-applying.
-- ------------------------------------------------------------
DO $$
DECLARE
  v_missing text;
BEGIN
  SELECT string_agg(t, ', ') INTO v_missing
  FROM unnest(ARRAY[
    'admin_users', 'registrations', 'pay_play_bookings',
    'pay_play_options', 'reviews'
  ]) AS t
  WHERE to_regclass('public.' || t) IS NULL;

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'Missing expected table(s): % — aborting hardening migration', v_missing;
  END IF;
END $$;

-- The review trigger was confirmed present in the audited database.
-- If it is missing here, the environment differs from the audit —
-- fail closed rather than silently applying a partial fix.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.reviews'::regclass
      AND tgname  = 'enforce_guest_review_state'
      AND NOT tgisinternal
  ) THEN
    RAISE EXCEPTION
      'enforce_guest_review_state trigger not found on public.reviews — apply 20261023120000_public_review_submissions.sql first';
  END IF;
END $$;

-- ------------------------------------------------------------
-- 1. Harden the RLS helpers.
--    * SET search_path = '' + fully qualified references: a
--      malicious or shadowing object in another schema can no
--      longer redirect the SECURITY DEFINER lookups.
--    * EXECUTE is revoked from PUBLIC and granted explicitly to
--      anon/authenticated/service_role. anon NEEDS it: the legacy
--      policies were created without a TO clause (roles = public),
--      so anon evaluates them, and a policy expression calling a
--      function the invoker cannot execute fails the whole query.
--      The helpers only reflect the caller's own JWT (auth.uid()),
--      so RPC access leaks nothing about other users.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE admin_users.id = auth.uid()
          AND admin_users.is_active = true
    );
$$;

CREATE OR REPLACE FUNCTION public.can_admin_write()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE admin_users.id = auth.uid()
          AND admin_users.is_active = true
          AND admin_users.role IN ('admin', 'editor')
    );
$$;

REVOKE ALL ON FUNCTION public.is_active_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_active_admin() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_admin()
  TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.can_admin_write() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_admin_write() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_admin_write()
  TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.is_active_admin() IS 'RLS helper: active admin_users row for auth.uid() (hardened 2026-11-04)';
COMMENT ON FUNCTION public.can_admin_write() IS 'RLS helper: active admin_users row with role admin or editor (hardened 2026-11-04)';

-- ------------------------------------------------------------
-- 2. Schema repair — columns the live frontend actually posts.
--    (No-ops where the columns already exist. Mirrors migration
--    20261024210000; without these, every guest booking submit
--    fails with 400 PGRST204.)
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
-- 3. Length guards for guest-supplied text (last line of defence;
--    the forms enforce limits client-side, the database enforces
--    them always). NOT VALID so pre-existing rows can never fail
--    the migration; a best-effort VALIDATE checks old rows after.
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
-- 4. Belt-and-braces: RLS must be enabled on the five audited
--    tables. (No-op where already enabled; never disables RLS.)
-- ------------------------------------------------------------
ALTER TABLE public.admin_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_play_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_play_options  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews           ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 5. Guest-state triggers.
--    BEFORE INSERT only; guests have no UPDATE privilege and no
--    UPDATE policy, so an UPDATE trigger is unnecessary.
--    Admins AND EDITORS (can_admin_write()) bypass enforcement so
--    the admin panel keeps full freedom. An active VIEWER does NOT
--    bypass: is_active_admin() is true for every active admin_users
--    row regardless of role, so using it here would let a viewer
--    submit a pre-published/forged review through the authenticated
--    pending-review INSERT policy ("Authenticated insert pending
--    reviews"). can_admin_write() (role IN ('admin','editor')) is
--    the correct privilege distinction — a viewer is sanitized as a
--    guest, exactly like anon. All three guest-state functions
--    run with an empty search_path and fully qualified references,
--    and none of them references admin_users directly (the
--    migration-12 review trigger did — recreated in 5d; a direct
--    reference breaks every anon submission once migration 14
--    revokes anon SELECT on admin_users).
--    Trigger functions are not RPC targets: EXECUTE is revoked
--    from PUBLIC/anon/authenticated (the trigger machinery calls
--    them as the table owner regardless).
-- ------------------------------------------------------------

-- 5a. pay_play_options.availability_status must exist before the
--     booking trigger references it (guarded add, mirroring the
--     tracked 20251011000000 migration; existing sessions default
--     to 'available' so nothing becomes unbookable).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'pay_play_options'
      AND column_name  = 'availability_status'
  ) THEN
    RAISE NOTICE 'availability_status missing on pay_play_options — adding it (matches 20251011000000)';
    ALTER TABLE public.pay_play_options
      ADD COLUMN availability_status TEXT DEFAULT 'available'
      CHECK (availability_status IN ('available', 'unavailable', 'temporarily_closed'));
  END IF;
END $$;

-- 5b. Registrations: guests always get status='new', no admin
--     notes, source forced to 'website' (unconditionally — a guest
--    -supplied source value is discarded, not preserved).
CREATE OR REPLACE FUNCTION public.enforce_guest_registration_state()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NOT public.can_admin_write() THEN
    NEW.status      = 'new';          -- guests never set lifecycle status
    NEW.admin_notes = NULL;           -- guests never write admin notes
    NEW.source      = 'website';      -- guests never label the channel
    NEW.full_name   = TRIM(NEW.full_name);
    NEW.email       = TRIM(NEW.email);
    IF NEW.message IS NOT NULL THEN
      NEW.message = TRIM(NEW.message);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_guest_registration_state ON public.registrations;
CREATE TRIGGER enforce_guest_registration_state
  BEFORE INSERT ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_guest_registration_state();

-- 5c. Bookings: guests never set payment/lifecycle fields; the
--     amount is ALWAYS the referenced session's authoritative
--     price; hidden (is_visible = false) or non-bookable
--     (availability_status != 'available') sessions are rejected.
CREATE OR REPLACE FUNCTION public.enforce_guest_booking_state()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_price INTEGER;
BEGIN
  IF NOT public.can_admin_write() THEN
    -- Guests (and viewers — see the section 5 header) may never set
    -- payment or lifecycle columns.
    NEW.payment_status    = 'pending';
    NEW.booking_status    = 'pending';
    NEW.payment_reference = NULL;
    NEW.payment_order_id  = NULL;
    NEW.payment_id        = NULL;

    -- Authoritative pricing AND scope: the amount is always the
    -- referenced session's price, and only sessions that are
    -- currently visible AND marked available may be booked.
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
$$;

DROP TRIGGER IF EXISTS enforce_guest_booking_state ON public.pay_play_bookings;
CREATE TRIGGER enforce_guest_booking_state
  BEFORE INSERT ON public.pay_play_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_guest_booking_state();

-- Trigger functions are implementation details, not RPC endpoints.
REVOKE ALL ON FUNCTION public.enforce_guest_registration_state() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_guest_registration_state() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.enforce_guest_booking_state() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_guest_booking_state() FROM anon, authenticated;

-- 5d. Reviews: the migration-12 trigger body queries admin_users
--     DIRECTLY as SECURITY INVOKER. Same defect as the legacy admin
--     policies (section 6b): once migration 14 revokes anon SELECT
--     on admin_users, every anon review submission dies inside the
--     trigger with "permission denied for table admin_users"
--     (confirmed on PG15 in the local harness). Recreated here with
--     IDENTICAL sanitization semantics, routed through
--     can_admin_write() (SECURITY DEFINER) instead — the same
--     pattern as 5b/5c, which the P1/P3 probes prove works for anon
--     callers. can_admin_write() (not is_active_admin()) is
--     deliberate: an active VIEWER submitting through the
--     authenticated pending-review policy must be sanitized as a
--     guest, not treated as an administrator. CREATE OR REPLACE
--     preserves the trigger (same signature), so the migration-12
--     trigger keeps firing.
CREATE OR REPLACE FUNCTION public.enforce_guest_review_state()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NOT public.can_admin_write() THEN
    NEW.is_visible    = FALSE;              -- always start pending
    NEW.is_featured   = FALSE;              -- guests never feature
    NEW.display_order = 0;
    NEW.photo_url     = NULL;
    NEW.photo_alt     = NULL;
    NEW.author_role   = NULL;
    NEW.review_date   = CURRENT_DATE;
    NEW.author_name   = TRIM(NEW.author_name);
    NEW.review_text   = TRIM(NEW.review_text);
    IF NEW.review_title IS NOT NULL THEN
      NEW.review_title = TRIM(NEW.review_title);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_guest_review_state() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_guest_review_state() FROM anon, authenticated;

-- ------------------------------------------------------------
-- 6. Scoped public INSERT policies.
--    The sweep drops ANY INSERT policy on the three guest-writable
--    tables whose role list includes anon, public OR authenticated —
--    this catches the live initial-schema policies (roles = {public}),
--    the migration-7 variants (roles = {anon}), and any
--    dashboard-created stray policy regardless of its name. The
--    canonical review policies (anon AND authenticated) are
--    recreated after the sweep.
--    Legitimate admin INSERT access flows through the "Admin write
--    <t>" FOR ALL policies (re)created in section 6b below — the
--    legacy "Admin full access" FOR ALL policies are REPLACED there
--    (see 6b for why keeping them would break the site).
--    The WITH CHECK runs on the post-trigger row, so the triggers
--    above and these policies enforce the same invariants.
-- ------------------------------------------------------------
DO $$
DECLARE
  r record;
  v_dropped integer := 0;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('registrations', 'pay_play_bookings', 'reviews')
      AND cmd = 'INSERT'
      AND roles && ARRAY['anon', 'public', 'authenticated']::name[]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    v_dropped := v_dropped + 1;
    RAISE NOTICE 'Dropped INSERT policy %.% (roles included anon/public/authenticated)', r.tablename, r.policyname;
  END LOOP;
  RAISE NOTICE 'INSERT policy sweep complete: % dropped', v_dropped;
END $$;

DROP POLICY IF EXISTS "Public insert guest registrations" ON public.registrations;
CREATE POLICY "Public insert guest registrations"
  ON public.registrations
  FOR INSERT
  TO anon
  WITH CHECK (
    status = 'new'
    AND admin_notes IS NULL
    AND source = 'website'
  );

DROP POLICY IF EXISTS "Public insert guest bookings" ON public.pay_play_bookings;
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
-- NOTE: no amount check here on purpose — the trigger owns the
-- amount (authoritative session price) and rewrites it before the
-- policy is evaluated; duplicating the lookup in the policy would
-- only add a second failure mode.

-- Reviews: recreate migration 1's canonical policy verbatim. The
-- sweep above removed any stray/duplicate INSERT policy (a permissive
-- duplicate would otherwise union with this one and let crafted
-- is_visible/is_featured values through to the WITH CHECK — the
-- trigger still forces them, but the policy layer must not rely on
-- that alone). The trigger (verified live) forces is_visible=FALSE,
-- is_featured=FALSE and display_order=0 for non-admins.
DROP POLICY IF EXISTS "Public insert pending reviews" ON public.reviews;
CREATE POLICY "Public insert pending reviews"
  ON public.reviews
  FOR INSERT
  TO anon
  WITH CHECK (
    is_visible = FALSE
    AND is_featured = FALSE
  );

-- Reviews: the SAME pending-review outcome for authenticated
-- visitors. The public review form uses supabase-js; if an
-- authenticated JWT is ever attached (legacy sb-*-auth-token
-- localStorage entry, magic-link hash detection, or future .auth.*
-- usage), PostgREST evaluates the request as `authenticated` — and
-- without this policy the only INSERT-capable policy for that role
-- is the admin FOR ALL policy, so an ordinary logged-in visitor's
-- review submission would be denied (4xx). This policy grants no new
-- privilege: the WITH CHECK is identical to the anon policy, and the
-- trigger still forces is_visible=FALSE, is_featured=FALSE and
-- display_order=0 for every non-admin. Active admins keep their
-- existing admin FOR ALL policy untouched.
DROP POLICY IF EXISTS "Authenticated insert pending reviews" ON public.reviews;
CREATE POLICY "Authenticated insert pending reviews"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_visible = FALSE
    AND is_featured = FALSE
  );

-- ------------------------------------------------------------
-- 6b. Replace the legacy "Admin full access <t>" FOR ALL policies
--     on the three guest-writable tables with the "Admin select <t>"
--     / "Admin write <t>" pair (same names and shape as migrations
--     2/6).
--
--     WHY THIS IS MANDATORY — confirmed empirically on PostgreSQL
--     15 in a disposable local harness (2026-11-05): permissive RLS
--     policies are OR'd together, so EVERY statement on these
--     tables carries the legacy policy's EXISTS(... admin_users ...)
--     subquery in its plan, and PostgreSQL permission-checks EVERY
--     relation in a planned statement — including subqueries inside
--     RLS policy expressions. Once migration 14 revokes anon SELECT
--     on admin_users, EVERY anon statement on these tables fails
--     with "permission denied for table admin_users": the guest
--     submissions AND the public review wall break outright (the
--     site goes down, it is not merely restricted). The same
--     mechanism affects every content table whose public-read
--     policy is not constant true — handled in 6c below.
--
--     The replacement keeps admin READ semantics exactly as the
--     legacy policies defined them (any ACTIVE admin_users row
--     passes, including role=viewer) but splits WRITE out to
--     can_admin_write() (role admin/editor) — the agreed role model
--     (admin/editor read+write, viewer read-only). Both helpers are
--     SECURITY DEFINER: no caller-evaluated admin_users reference
--     remains in any policy, so the executor never needs the caller
--     to hold privileges on admin_users.
--
--     The sweep is unconditional for the guest tables (like the
--     admin_users rebuild in section 7): every non-INSERT policy
--     targeting public/anon/authenticated is dropped — the legacy
--     "Admin full access" policies, any migration-2 "Admin select/
--     write" variants, and dashboard-created strays — so the final
--     inventory is deterministic and the self-verification in
--     section 8 can assert it exactly.
-- ------------------------------------------------------------
DO $legacy_admin_sweep$
DECLARE
  r record;
  v_dropped integer := 0;
BEGIN
  FOR r IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('registrations', 'pay_play_bookings', 'reviews')
      AND cmd <> 'INSERT'
      AND roles && ARRAY['public', 'anon', 'authenticated']::name[]
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
    v_dropped := v_dropped + 1;
    RAISE NOTICE 'Dropped legacy non-INSERT policy % on %', r.policyname, r.tablename;
  END LOOP;
  RAISE NOTICE 'Guest-table legacy policy sweep complete: % dropped', v_dropped;
END $legacy_admin_sweep$;

-- Public review wall read policy — recreated verbatim from the
-- initial schema (the sweep above removed it together with the
-- legacy admin policies; anon needs it to read published reviews).
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews"
  ON public.reviews
  FOR SELECT
  USING (is_visible = true);

-- NOTE ON THE PAIR DESIGN (B-1 fix): a single "Admin manage <t>"
-- FOR ALL policy via is_active_admin() would grant WRITE access to
-- every active admin_users row — including role=viewer, breaking
-- the agreed role model (admin/editor read+write, viewer
-- read-only). The legacy policies are therefore replaced with the
-- SAME pair migrations 2/6 use, under the SAME canonical names, so
-- the converged state is identical whichever baseline the live
-- database started from:
--   * "Admin select <t>"  FOR SELECT TO authenticated USING
--     (public.is_active_admin()) — every active admin_users row
--     (admin, editor AND viewer) may read;
--   * "Admin write <t>"   FOR ALL TO authenticated USING/WITH CHECK
--     (public.can_admin_write()) — only role admin/editor may write.
-- "Admin write" is FOR ALL (PostgreSQL has no write-only command
-- form), so it also covers SELECT — permissive policies OR, and a
-- viewer passes "Admin select" but fails "Admin write"'s
-- can_admin_write(), so the union grants the viewer exactly
-- read-only. The DROP POLICY IF EXISTS guards make the CREATEs
-- collision-safe even if a same-named policy somehow survived the
-- sweep above (e.g. a dashboard-created policy targeting only
-- service_role, which the sweep intentionally does not touch).
DROP POLICY IF EXISTS "Admin select registrations" ON public.registrations;
CREATE POLICY "Admin select registrations"
  ON public.registrations
  FOR SELECT
  TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "Admin write registrations" ON public.registrations;
CREATE POLICY "Admin write registrations"
  ON public.registrations
  FOR ALL
  TO authenticated
  USING (public.can_admin_write())
  WITH CHECK (public.can_admin_write());

DROP POLICY IF EXISTS "Admin select pay play bookings" ON public.pay_play_bookings;
CREATE POLICY "Admin select pay play bookings"
  ON public.pay_play_bookings
  FOR SELECT
  TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "Admin write pay play bookings" ON public.pay_play_bookings;
CREATE POLICY "Admin write pay play bookings"
  ON public.pay_play_bookings
  FOR ALL
  TO authenticated
  USING (public.can_admin_write())
  WITH CHECK (public.can_admin_write());

DROP POLICY IF EXISTS "Admin select reviews" ON public.reviews;
CREATE POLICY "Admin select reviews"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "Admin write reviews" ON public.reviews;
CREATE POLICY "Admin write reviews"
  ON public.reviews
  FOR ALL
  TO authenticated
  USING (public.can_admin_write())
  WITH CHECK (public.can_admin_write());

-- ------------------------------------------------------------
-- 6c. Same defect, same class of fix, for the ten content tables
--     the public website reads. Their public-read policies are
--     "USING (is_visible = true)" / "USING (is_public = true)" —
--     NOT constant true — so the OR'd legacy EXISTS(...admin_users...)
--     subquery survives planning and, after migration 14's revokes,
--     breaks every anon read: homepage content, training ranges,
--     coaches, facilities, achievements, gallery, the Pay & Play
--     session listing, motivational quotes and contact settings.
--     Only site_section_settings (USING (true)) constant-folds.
--
--     Unlike the guest tables, these tables may instead carry
--     migration-2 "Admin select/write" policies (is_active_admin()/
--     can_admin_write() based — no admin_users reference, therefore
--     safe). The swap is therefore CONDITIONAL: a table's legacy
--     admin_users-referencing FOR ALL policy is replaced only where
--     it actually exists (i.e. migration 2 never ran for it). Where
--     migration-2 policies are present they are left untouched —
--     replacing their role-split write policies with the
--     viewer-inclusive is_active_admin() policy would WEAKEN them.
-- ------------------------------------------------------------
DO $content_admin_sweep$
DECLARE
  r record;
  v_swapped integer := 0;
BEGIN
  FOR r IN
    SELECT t.tablename, t.admin_label, p.policyname
    FROM (VALUES
      ('academy_content',       'academy content'),
      ('training_ranges',       'training ranges'),
      ('coaches',               'coaches'),
      ('facilities',            'facilities'),
      ('achievements',          'achievements'),
      ('gallery_images',        'gallery images'),
      ('pay_play_options',      'pay play options'),
      ('motivational_quotes',   'motivational quotes'),
      ('contact_settings',      'contact settings'),
      ('site_section_settings', 'site section settings')
    ) AS t(tablename, admin_label)
    JOIN pg_policies p
      ON p.schemaname = 'public'
     AND p.tablename  = t.tablename
     AND p.cmd = 'ALL'
     AND p.roles && ARRAY['public', 'anon', 'authenticated']::name[]
    WHERE position('admin_users'
            in lower(coalesce(p.qual, '') || ' ' || coalesce(p.with_check, ''))) > 0
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
    -- Same pair design as section 6b (B-1 fix): read for every
    -- active admin_users row, write only for admin/editor. The
    -- DROP IF EXISTS guards make this collision-safe if a
    -- same-named pair policy somehow already exists.
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      'Admin select ' || r.admin_label, r.tablename);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated '
      'USING (public.is_active_admin())',
      'Admin select ' || r.admin_label, r.tablename);
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      'Admin write ' || r.admin_label, r.tablename);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated '
      'USING (public.can_admin_write()) WITH CHECK (public.can_admin_write())',
      'Admin write ' || r.admin_label, r.tablename);
    v_swapped := v_swapped + 1;
    RAISE NOTICE 'Swapped legacy admin policy % on % -> "Admin select %" + "Admin write %"',
      r.policyname, r.tablename, r.admin_label, r.admin_label;
  END LOOP;
  RAISE NOTICE 'Content-table admin policy swap complete: % swapped', v_swapped;
END $content_admin_sweep$;

-- ------------------------------------------------------------
-- 7. admin_users RLS rebuild.
--    The initial blanket "Admin full access admin_users" policy
--    (FOR ALL, TO public) let any authenticated admin INSERT/
--    UPDATE/DELETE admin_users through the API — including their
--    own role and is_active flag. Dashboard-created policies may
--    also exist (e.g. an authenticated SELECT policy named
--    "Admins can read their own record") — a roles-filtered sweep
--    would MISS those, so this sweep drops EVERY policy on
--    admin_users regardless of its roles or name. What remains:
--      * an own-row SELECT for active authenticated admins (the
--        login/verification flow reads exactly this row: select=
--        role,is_active filtered by id=eq.<uid>), and
--      * nothing else — admin_users management (creating admins,
--        deactivating, role changes) happens in the Supabase
--        dashboard as postgres/service_role.
--    is_active_admin()/can_admin_write() are SECURITY DEFINER and
--    bypass RLS, so every other table's admin policies keep
--    working unchanged.
-- ------------------------------------------------------------
DO $$
DECLARE
  r record;
  v_dropped integer := 0;
BEGIN
  FOR r IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_users'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_users', r.policyname);
    v_dropped := v_dropped + 1;
    RAISE NOTICE 'Dropped admin_users policy %', r.policyname;
  END LOOP;
  RAISE NOTICE 'admin_users policy sweep complete: % dropped', v_dropped;
END $$;

DROP POLICY IF EXISTS "Admin select own account" ON public.admin_users;
CREATE POLICY "Admin select own account"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    AND is_active = true
  );

-- ------------------------------------------------------------
-- 8. Self-verification — the migration ABORTS (transaction rolls
--    back, leaving the pre-apply state intact) if the final policy
--    inventory deviates from the intended result in any way.
--
--    Checks are STRUCTURAL (exact name, table, command, role array,
--    permissive setting, USING clause) and SEMANTIC: every WITH
--    CHECK expression is evaluated against one canonical (must-pass)
--    and several forged (must-fail) test rows via read-only dynamic
--    SQL. Semantic evaluation is deliberate: pg_get_expr output
--    varies in whitespace, parentheses and explicit ::text casts
--    between PostgreSQL versions, so a textual comparison would be
--    fragile in both directions (false pass AND false fail).
-- ------------------------------------------------------------
DO $$
DECLARE
  v_count integer;
  v_names text;
  v_pol   record;
  v_ok    boolean;
  v_qual  text;
  v_wchk  text;
BEGIN
  -- ----------------------------------------------------------
  -- 8a. admin_users: EXACTLY ONE policy — the own-row SELECT,
  --     TO authenticated, PERMISSIVE, with a USING clause that
  --     constrains both id and is_active.
  -- ----------------------------------------------------------
  SELECT count(*), string_agg(policyname, ' | ') INTO v_count, v_names
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'admin_users';

  IF v_count <> 1 OR v_names IS DISTINCT FROM 'Admin select own account' THEN
    RAISE EXCEPTION 'admin_users policy inventory unexpected after hardening: % policy/policies (%) — expected exactly "Admin select own account"', v_count, v_names;
  END IF;

  SELECT cmd, roles, permissive, qual INTO v_pol
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'admin_users'
    AND policyname = 'Admin select own account';

  -- The USING expression cannot be evaluated semantically inside the
  -- migration (auth.uid() depends on the caller), so it is verified
  -- by normalized-content checks: whitespace-stripped lowercase text
  -- must contain BOTH required atoms and must contain NO 'or'/'not'
  -- (an OR would widen the policy, a NOT would invert it; extra AND
  -- conjuncts can only narrow and are therefore tolerated). The
  -- GROUP P5 live probes are the behavioral proof.
  v_qual := regexp_replace(lower(coalesce(v_pol.qual, '')), '\s+', '', 'g');

  IF v_pol.cmd <> 'SELECT'
     OR v_pol.roles IS DISTINCT FROM ARRAY['authenticated']::name[]
     OR v_pol.permissive IS DISTINCT FROM 'PERMISSIVE'
     OR v_pol.qual IS NULL
     OR position('id=auth.uid()' in v_qual) = 0
     OR position('is_active=true' in v_qual) = 0
     OR position('or' in v_qual) <> 0
     OR position('not' in v_qual) <> 0 THEN
    RAISE EXCEPTION '"Admin select own account" misconfigured (cmd=%, roles=%, permissive=%, qual=%)',
      v_pol.cmd, v_pol.roles, v_pol.permissive, v_pol.qual;
  END IF;

  -- ----------------------------------------------------------
  -- 8b. The three guest-writable tables must carry EXACTLY FOUR
  --     INSERT policies for anon/public/authenticated — the
  --     canonical ones. A leftover or duplicate policy would union
  --     its WITH CHECK with the scoped ones.
  -- ----------------------------------------------------------
  SELECT count(*), string_agg(policyname, ' | ' ORDER BY policyname)
    INTO v_count, v_names
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('registrations', 'pay_play_bookings', 'reviews')
    AND cmd = 'INSERT'
    AND roles && ARRAY['anon', 'public', 'authenticated']::name[];

  IF v_count <> 4 THEN
    RAISE EXCEPTION 'Guest-writable tables carry % INSERT policy/policies for anon/public/authenticated (%) — expected exactly the four canonical ones', v_count, v_names;
  END IF;

  -- ----------------------------------------------------------
  -- 8c. Per-policy structural + semantic verification. The dynamic
  --     statements below are SELECT-only (they evaluate the stored
  --     expression against in-memory VALUES rows; nothing is written).
  -- ----------------------------------------------------------
  FOR v_pol IN
    SELECT tablename, policyname, roles, permissive, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('registrations', 'pay_play_bookings', 'reviews')
      AND cmd = 'INSERT'
      AND roles && ARRAY['anon', 'public', 'authenticated']::name[]
  LOOP
    -- pg_policies.permissive is TEXT ('PERMISSIVE'|'RESTRICTIVE'),
    -- not boolean — compare against the expected text value
    -- (IS DISTINCT FROM is the NULL-safe form of <>).
    IF v_pol.permissive IS DISTINCT FROM 'PERMISSIVE' THEN
      RAISE EXCEPTION 'Policy "%" on % must be PERMISSIVE (found %)', v_pol.policyname, v_pol.tablename, v_pol.permissive;
    END IF;
    IF v_pol.qual IS NOT NULL THEN
      RAISE EXCEPTION 'INSERT policy "%" on % must not carry a USING clause', v_pol.policyname, v_pol.tablename;
    END IF;
    IF v_pol.with_check IS NULL THEN
      RAISE EXCEPTION 'INSERT policy "%" on % has no WITH CHECK expression', v_pol.policyname, v_pol.tablename;
    END IF;

    IF v_pol.policyname = 'Public insert guest registrations' THEN
      IF v_pol.tablename <> 'registrations'
         OR v_pol.roles IS DISTINCT FROM ARRAY['anon']::name[] THEN
        RAISE EXCEPTION '"Public insert guest registrations" must be ON registrations TO anon (found on %, roles=%)', v_pol.tablename, v_pol.roles;
      END IF;
      -- Canonical guest row MUST pass.
      BEGIN
        EXECUTE format(
          'SELECT (%s) FROM (VALUES (%L::text, %L::text, %L::text)) AS t(status, admin_notes, source)',
          v_pol.with_check, 'new', NULL, 'website'
        ) INTO v_ok;
      EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'WITH CHECK of "Public insert guest registrations" is not evaluable: %', SQLERRM;
      END;
      IF v_ok IS NOT TRUE THEN
        RAISE EXCEPTION '"Public insert guest registrations" rejects the canonical guest row (status=new, admin_notes=NULL, source=website)';
      END IF;
      -- Forged rows MUST all fail. "IS NOT TRUE" (not "NOT (...)") is
      -- deliberate: a NULL comparison result must also count as a
      -- rejection (three-valued logic — NOT NULL is NULL, which would
      -- silently exclude the row from the count).
      BEGIN
        EXECUTE format(
          'SELECT count(*) FROM (VALUES (%L::text, %L::text, %L::text), (%L::text, %L::text, %L::text), (%L::text, %L::text, %L::text), (%L::text, %L::text, %L::text)) AS t(status, admin_notes, source) WHERE (%s) IS NOT TRUE',
          'completed', NULL, 'website',
          'new', 'forged note', 'website',
          'new', NULL, 'admin',
          'new', NULL, NULL,
          v_pol.with_check
        ) INTO v_count;
      EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'WITH CHECK of "Public insert guest registrations" is not evaluable: %', SQLERRM;
      END;
      IF v_count <> 4 THEN
        RAISE EXCEPTION '"Public insert guest registrations" accepts forged guest rows (% of 4 test rows passed)', 4 - v_count;
      END IF;

    ELSIF v_pol.policyname = 'Public insert guest bookings' THEN
      IF v_pol.tablename <> 'pay_play_bookings'
         OR v_pol.roles IS DISTINCT FROM ARRAY['anon']::name[] THEN
        RAISE EXCEPTION '"Public insert guest bookings" must be ON pay_play_bookings TO anon (found on %, roles=%)', v_pol.tablename, v_pol.roles;
      END IF;
      -- Canonical guest row MUST pass.
      BEGIN
        EXECUTE format(
          'SELECT (%s) FROM (VALUES (%L::text, %L::text, %L::text, %L::text, %L::text)) AS t(booking_status, payment_status, payment_reference, payment_order_id, payment_id)',
          v_pol.with_check, 'pending', 'pending', NULL, NULL, NULL
        ) INTO v_ok;
      EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'WITH CHECK of "Public insert guest bookings" is not evaluable: %', SQLERRM;
      END;
      IF v_ok IS NOT TRUE THEN
        RAISE EXCEPTION '"Public insert guest bookings" rejects the canonical guest row (both pending, all payment refs NULL)';
      END IF;
      -- Forged rows MUST all fail (lifecycle, payment status, and
      -- each payment reference column set).
      BEGIN
        EXECUTE format(
          'SELECT count(*) FROM (VALUES (%L::text, %L::text, %L::text, %L::text, %L::text), (%L::text, %L::text, %L::text, %L::text, %L::text), (%L::text, %L::text, %L::text, %L::text, %L::text), (%L::text, %L::text, %L::text, %L::text, %L::text), (%L::text, %L::text, %L::text, %L::text, %L::text)) AS t(booking_status, payment_status, payment_reference, payment_order_id, payment_id) WHERE (%s) IS NOT TRUE',
          'confirmed', 'pending', NULL, NULL, NULL,
          'pending', 'paid', NULL, NULL, NULL,
          'pending', 'pending', 'ref', NULL, NULL,
          'pending', 'pending', NULL, 'ord', NULL,
          'pending', 'pending', NULL, NULL, 'pay',
          v_pol.with_check
        ) INTO v_count;
      EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'WITH CHECK of "Public insert guest bookings" is not evaluable: %', SQLERRM;
      END;
      IF v_count <> 5 THEN
        RAISE EXCEPTION '"Public insert guest bookings" accepts forged booking rows (% of 5 test rows passed)', 5 - v_count;
      END IF;

    ELSIF v_pol.policyname IN ('Public insert pending reviews',
                               'Authenticated insert pending reviews') THEN
      IF v_pol.tablename <> 'reviews' THEN
        RAISE EXCEPTION '"%" must be ON reviews (found on %)', v_pol.policyname, v_pol.tablename;
      END IF;
      IF v_pol.roles IS DISTINCT FROM (
        CASE WHEN v_pol.policyname = 'Public insert pending reviews'
             THEN ARRAY['anon']::name[]
             ELSE ARRAY['authenticated']::name[] END
      ) THEN
        RAISE EXCEPTION '"%" has unexpected roles=%', v_pol.policyname, v_pol.roles;
      END IF;
      -- Canonical pending row MUST pass.
      BEGIN
        EXECUTE format(
          'SELECT (%s) FROM (VALUES (false::boolean, false::boolean)) AS t(is_visible, is_featured)',
          v_pol.with_check
        ) INTO v_ok;
      EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'WITH CHECK of "%" is not evaluable: %', v_pol.policyname, SQLERRM;
      END;
      IF v_ok IS NOT TRUE THEN
        RAISE EXCEPTION '"%" rejects the canonical pending row (is_visible=false, is_featured=false)', v_pol.policyname;
      END IF;
      -- Publish attempts MUST all fail ("IS NOT TRUE" counts NULL
      -- comparison results as rejections — three-valued logic).
      BEGIN
        EXECUTE format(
          'SELECT count(*) FROM (VALUES (true::boolean, false::boolean), (false::boolean, true::boolean), (true::boolean, true::boolean)) AS t(is_visible, is_featured) WHERE (%s) IS NOT TRUE',
          v_pol.with_check
        ) INTO v_count;
      EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'WITH CHECK of "%" is not evaluable: %', v_pol.policyname, SQLERRM;
      END;
      IF v_count <> 3 THEN
        RAISE EXCEPTION '"%" accepts a publish attempt (% of 3 test rows passed)', v_pol.policyname, 3 - v_count;
      END IF;

    ELSE
      RAISE EXCEPTION 'Unexpected INSERT policy "%" on % after hardening', v_pol.policyname, v_pol.tablename;
    END IF;
  END LOOP;

  -- ----------------------------------------------------------
  -- 8d. Belt-and-braces: no residual anon/public/authenticated
  --     INSERT policy outside the four canonical names (subsumed by
  --     8b's count, kept as an explicit guard).
  -- ----------------------------------------------------------
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('registrations', 'pay_play_bookings', 'reviews')
      AND cmd = 'INSERT'
      AND roles && ARRAY['anon', 'public', 'authenticated']::name[]
      AND policyname NOT IN (
        'Public insert guest registrations',
        'Public insert guest bookings',
        'Public insert pending reviews',
        'Authenticated insert pending reviews'
      )
  ) THEN
    RAISE EXCEPTION 'Residual unscoped INSERT policy on a guest-writable table after hardening';
  END IF;

  -- ----------------------------------------------------------
  -- 8e. INVARIANT: no policy on any audited table may reference
  --     admin_users directly any more. A direct reference in a
  --     policy expression forces the executor to permission-check
  --     admin_users for EVERY caller evaluating that policy — once
  --     migration 14 revokes anon SELECT on admin_users, every anon
  --     statement on the affected table fails (confirmed on PG15).
  --     Sections 6b/6c replace all such policies with
  --     is_active_admin()-based ones; any survivor aborts the
  --     migration. (is_active_admin()/can_admin_write() are SECURITY
  --     DEFINER — their internal admin_users access is safe. The
  --     admin_users own-row policy constrains id/is_active without
  --     naming the table.)
  -- ----------------------------------------------------------
  SELECT count(*), string_agg(tablename || '.' || policyname, ' | ')
    INTO v_count, v_names
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN (
      'admin_users', 'registrations', 'pay_play_bookings', 'reviews',
      'pay_play_options', 'academy_content', 'training_ranges', 'coaches',
      'facilities', 'achievements', 'gallery_images',
      'motivational_quotes', 'contact_settings', 'site_section_settings'
    )
    AND (coalesce(qual, '') || ' ' || coalesce(with_check, '')) ILIKE '%admin_users%';

  IF v_count <> 0 THEN
    RAISE EXCEPTION 'Policy self-verification FAILED: % policy/policies still reference admin_users directly (%) — every anon statement on those tables would fail once migration 14 revokes anon SELECT on admin_users', v_count, v_names;
  END IF;

  -- ----------------------------------------------------------
  -- 8f. Guest tables: EXACT final inventory. The section-6 sweeps
  --     drop every other policy targeting public/anon/authenticated
  --     before these are created, so this inventory is deterministic
  --     regardless of which earlier migrations ran. The pairs
  --     converge to the migrations-2/6 canonical names whether the
  --     live baseline was legacy "Admin full access" or an already
  --     split "Admin select"/"Admin write" state.
  -- ----------------------------------------------------------
  SELECT string_agg(policyname, ' | ' ORDER BY policyname) INTO v_names
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'registrations';
  IF v_names IS DISTINCT FROM
     'Admin select registrations | Admin write registrations | Public insert guest registrations' THEN
    RAISE EXCEPTION 'registrations policy inventory unexpected: %', v_names;
  END IF;

  SELECT string_agg(policyname, ' | ' ORDER BY policyname) INTO v_names
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'pay_play_bookings';
  IF v_names IS DISTINCT FROM
     'Admin select pay play bookings | Admin write pay play bookings | Public insert guest bookings' THEN
    RAISE EXCEPTION 'pay_play_bookings policy inventory unexpected: %', v_names;
  END IF;

  SELECT string_agg(policyname, ' | ' ORDER BY policyname) INTO v_names
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'reviews';
  IF v_names IS DISTINCT FROM
     'Admin select reviews | Admin write reviews | Authenticated insert pending reviews | Public insert pending reviews | Public read reviews' THEN
    RAISE EXCEPTION 'reviews policy inventory unexpected: %', v_names;
  END IF;

  -- ----------------------------------------------------------
  -- 8g. The "Admin select"/"Admin write" pair on each guest table:
  --     * select policy — FOR SELECT, TO authenticated, PERMISSIVE,
  --       USING is_active_admin()-based, no direct admin_users
  --       reference, no OR/NOT widening;
  --     * write policy — FOR ALL, TO authenticated, PERMISSIVE,
  --       USING and WITH CHECK both can_admin_write()-based (NOT
  --       is_active_admin(), which would re-open the viewer write
  --       path this pair exists to close), no direct admin_users
  --       reference, no OR/NOT widening.
  --     Combined with 8f's exact inventory this leaves no viewer
  --     write path: the only write-capable policies on these tables
  --     are the three "Admin write" policies, and each requires
  --     role admin/editor. (Like 8a, the expressions are caller-
  --     dependent and cannot be evaluated semantically inside the
  --     migration; the GROUP P live probes are the behavioral proof.)
  -- ----------------------------------------------------------
  FOR v_pol IN
    SELECT tablename, policyname, cmd, roles, permissive, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('registrations', 'pay_play_bookings', 'reviews')
      AND (
        policyname = 'Admin select ' || CASE tablename
          WHEN 'registrations' THEN 'registrations'
          WHEN 'pay_play_bookings' THEN 'pay play bookings'
          ELSE 'reviews' END
        OR policyname = 'Admin write ' || CASE tablename
          WHEN 'registrations' THEN 'registrations'
          WHEN 'pay_play_bookings' THEN 'pay play bookings'
          ELSE 'reviews' END
      )
  LOOP
    v_qual := regexp_replace(lower(coalesce(v_pol.qual, '')), '\s+', '', 'g');
    v_wchk := regexp_replace(lower(coalesce(v_pol.with_check, '')), '\s+', '', 'g');
    IF v_pol.policyname LIKE 'Admin select %' THEN
      -- Read policy: SELECT-only, is_active_admin().
      IF v_pol.cmd <> 'SELECT'
         OR v_pol.roles IS DISTINCT FROM ARRAY['authenticated']::name[]
         OR v_pol.permissive IS DISTINCT FROM 'PERMISSIVE'
         OR position('is_active_admin()' in v_qual) = 0
         OR position('admin_users' in v_qual) <> 0
         OR position('or' in v_qual) <> 0
         OR position('not' in v_qual) <> 0
         OR v_pol.with_check IS NOT NULL THEN
        RAISE EXCEPTION '"%" misconfigured (cmd=%, roles=%, permissive=%, using=%, with_check=%)',
          v_pol.policyname, v_pol.cmd, v_pol.roles, v_pol.permissive, v_pol.qual, v_pol.with_check;
      END IF;
    ELSE
      -- Write policy: FOR ALL, can_admin_write() on BOTH sides —
      -- an is_active_admin()-based write policy would grant the
      -- viewer write access (the B-1 defect).
      IF v_pol.cmd <> 'ALL'
         OR v_pol.roles IS DISTINCT FROM ARRAY['authenticated']::name[]
         OR v_pol.permissive IS DISTINCT FROM 'PERMISSIVE'
         OR position('can_admin_write()' in v_qual) = 0
         OR position('is_active_admin()' in v_qual) <> 0
         OR position('admin_users' in v_qual) <> 0
         OR position('or' in v_qual) <> 0
         OR position('not' in v_qual) <> 0
         OR position('can_admin_write()' in v_wchk) = 0
         OR position('is_active_admin()' in v_wchk) <> 0
         OR position('admin_users' in v_wchk) <> 0
         OR position('or' in v_wchk) <> 0
         OR position('not' in v_wchk) <> 0 THEN
        RAISE EXCEPTION '"%" misconfigured (cmd=%, roles=%, permissive=%, using=%, with_check=%)',
          v_pol.policyname, v_pol.cmd, v_pol.roles, v_pol.permissive, v_pol.qual, v_pol.with_check;
      END IF;
    END IF;
  END LOOP;

  -- Exactly six pair policies must exist (3 tables x select+write);
  -- the loop above validates their shape, this asserts the count so
  -- a missing half of any pair also fails.
  SELECT count(*) INTO v_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('registrations', 'pay_play_bookings', 'reviews')
    AND policyname LIKE 'Admin select %';
  IF v_count <> 3 THEN
    RAISE EXCEPTION 'expected 3 "Admin select" policies on the guest tables, found %', v_count;
  END IF;
  SELECT count(*) INTO v_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('registrations', 'pay_play_bookings', 'reviews')
    AND policyname LIKE 'Admin write %';
  IF v_count <> 3 THEN
    RAISE EXCEPTION 'expected 3 "Admin write" policies on the guest tables, found %', v_count;
  END IF;

  -- ----------------------------------------------------------
  -- 8h. Guest trigger functions must not reference admin_users
  --     directly: they execute with the CALLER's privileges
  --     (SECURITY INVOKER), so after migration 14 revokes anon
  --     SELECT on admin_users every anon submission would die
  --     inside the trigger (confirmed on PG15 — the migration-12
  --     review trigger did exactly this and is recreated in 5d).
  --     The SECURITY DEFINER helpers are exempt: their internal
  --     admin_users access runs with owner privileges.
  -- ----------------------------------------------------------
  SELECT count(*), string_agg(proname, ' | ') INTO v_count, v_names
  FROM pg_proc
  WHERE pronamespace = 'public'::regnamespace
    AND proname IN ('enforce_guest_registration_state',
                    'enforce_guest_booking_state',
                    'enforce_guest_review_state')
    AND prosrc ILIKE '%admin_users%';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'Policy self-verification FAILED: guest trigger function(s) % still reference admin_users directly — anon submissions would fail after the migration-14 revokes', v_names;
  END IF;

  RAISE NOTICE 'Policy self-verification PASSED (admin_users = 1 own-row SELECT; guest tables carry exactly the canonical policies: 4 scoped INSERT + Public read reviews + Admin select (FOR SELECT, is_active_admin) / Admin write (FOR ALL, can_admin_write) pairs — viewer read-only enforced at policy level; no policy on any audited table references admin_users directly; guest trigger functions clean and use can_admin_write for the admin bypass; WITH CHECK semantics verified against canonical + forged rows)';
END $$;

-- ------------------------------------------------------------
-- POST-APPLY PROBES (run manually with the anon key, no auth).
-- Outcomes differ by stage — both are secure, but read carefully:
--
-- AFTER 13 ONLY (privileges still permissive):
--   Tampered columns are SILENTLY DISCARDED by the triggers, then
--   the post-trigger WITH CHECK passes on the sanitized row:
--     POST /rest/v1/registrations
--       {"full_name":"probe","email":"p@e.com","status":"completed"}  → 201
--         stored row: status='new' (forged value discarded)
--       {"full_name":"probe","email":"p@e.com","source":"admin"}      → 201
--         stored row: source='website' (forged value discarded)
--     POST /rest/v1/pay_play_bookings
--       {...,"booking_status":"confirmed","amount":999999}            → 201
--         stored row: booking_status='pending', amount=session price
--     POST /rest/v1/reviews
--       {...,"is_visible":true,"display_order":99}                    → 201
--         stored row: is_visible=false, display_order=0
--
-- AFTER 13 + 14 (least-privilege grants applied):
--   Tampered columns are REJECTED at the privilege layer — anon has
--   no INSERT grant on those columns at all, so PostgREST returns a
--   4xx permission error before the row even reaches the trigger:
--     the same bodies as above                                        → 4xx
--   Valid submissions (canonical fields only) still return 201.
--
-- READ PROBES (after 13): anon SELECT returns 200 [] (RLS, no
--   policy). After 14: anon SELECT on registrations/bookings/
--   admin_users is revoked entirely → 4xx. Either way, zero rows.
--
-- AUTHENTICATED NON-ADMIN REVIEW PROBE (any Supabase Auth user
--   WITHOUT an active admin_users row, sending the user's JWT):
--     POST /rest/v1/reviews
--       {"author_name":"probe","rating":5,"review_text":"probe"}      → 201
--         (allowed by "Authenticated insert pending reviews"; the
--          trigger sanitizes: is_visible=false, is_featured=false,
--          display_order=0)
--       {..., "is_visible":true, "display_order":99}                  → 201
--         at BOTH stages: authenticated holds table-level INSERT
--         (migration 14), so the row reaches the trigger, which
--         discards the forged values; the WITH CHECK then passes.
--         (Only ANON gets the 4xx privilege rejection — anon has no
--         column grant on is_visible/display_order.)
--   Active admins and editors keep full access via the recreated
--   "Admin write reviews" policy (section 6b); active viewers can
--   read reviews via "Admin select reviews" but their submissions
--   are sanitized to pending by the trigger (can_admin_write gate).
--
-- HIDDEN-SESSION PROBE (works at BOTH stages, because session_id IS
--   in the anon grant list so the insert reaches the trigger):
--     POST /rest/v1/pay_play_bookings
--       {..., "session_id":"<hidden-or-closed-session-uuid>"}         → 4xx/5xx
--       (trigger raises 'Booking rejected: the selected session is
--        not available' — nonexistent sessions fail identically)
--
-- Delete any 201 probe rows afterwards via the admin panel or SQL.
-- ============================================================
