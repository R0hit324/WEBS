-- ============================================================
-- 2026-11-03 — Phase 6: Registration source enforcement + anon
-- column-level grants (F-14, F-15)
--
-- Two gaps found while reconciling the full chain in the final
-- master review:
--
-- F-14  The Phase 2 guest trigger only DEFAULTED registrations
--       .source to 'website' when the guest supplied NULL. A hand-
--       crafted anon INSERT {"source":"admin"} would be stored.
--       Harmless today (no behaviour keys off non-website source),
--       but it lets a visitor claim records came from another
--       channel — an integrity/audit concern and a direct violation
--       of the "database controls provenance" design.
--       Fix: hard-force NEW.source = 'website' for non-admin
--       inserts AND raise the policy WITH CHECK to require it
--       (post-trigger row, so both agree).
--
-- F-15  No column-level grants exist in the repo chain. Supabase's
--       default privileges give the anon role table-level ALL on
--       public tables, so guest writes are only limited by policy +
--       trigger expressions. RLS currently neutralizes every route,
--       but a future policy mistake would silently re-open protected
--       columns (or, for tables without an anon SELECT policy,
--       forgetting one would rely purely on absence — see TRUNCATE,
--       which RLS does not govern at all).
--       Fix: reduce anonymous table-level privileges on exactly the
--       three guest-submitted paths and grant INSERT on the
--       canonical guest columns only:
--         admin_users, registrations, pay_play_bookings  → REVOKE ALL
--           + column-level INSERT grant (registration/booking lists)
--         reviews → REVOKE ALL, re-grant table-level SELECT (the
--           is_visible hotspot policy still applies) + column-level
--           INSERT grant (canonical list); no UPDATE/DELETE/TRUNCATE
--       authenticated / service_role are untouched. Admin panel,
--       service integrations and the public review hotspot keep
--       working unchanged.
--
-- F-16  admin_users has RLS ENABLED but NO policy anywhere in the
--       chain (initial schema deferred policy creation to the
--       Dashboard). Consequences per environment:
--         - if prod has NO admin_users policies → the admin route
--           guard's own-row SELECT returns zero rows and admin
--           login is broken (default deny);
--         - if prod has a permissive manual policy (UNKNOWN) →
--           any active admin row (including role='viewer') can read
--           ALL admin accounts and possibly self-promote.
--       Fix (self-contained, role-correct): add a minimal SELECT
--       policy exposing ONLY the caller's own admin row to
--       authenticated users (what the login/route guard requires),
--       and create NO UPDATE/DELETE policy for any normal role —
--       admin-account administration stays a superuser/SQL-task,
--       exactly as the app uses it (no admin Users UI exists).
--       Existing broader prod policies (if any) remain additive;
--       this policy cannot weaken them.
--
-- Column GRANTs are FAIL-CLOSED: every canonical column must exist
-- or the whole migration raises an EXCEPTION and aborts (nothing is
-- granted partially, and — under the migration runner — every
-- statement in this file rolls back). The canonical lists mirror the
-- live frontend payloads exactly (RegistrationPage.js allowedFields,
-- PayPlaySessionPage.jsx submit payload, ReviewForm.js payload).
--
-- Reversible; see ROLLBACK notes at bottom. Reviewed SQL only — not
-- executed against any live database.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Registration: hard-forced source + tightened WITH CHECK
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_guest_registration_state()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_active_admin() THEN
    NEW.status      = 'new';          -- guests never set lifecycle status
    NEW.admin_notes = NULL;           -- guests never write admin notes
    NEW.source      = 'website';      -- admin provenance is forced, not deduced
    NEW.full_name   = TRIM(NEW.full_name);
    NEW.email       = TRIM(NEW.email);
    IF NEW.message IS NOT NULL THEN
      NEW.message = TRIM(NEW.message);
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

-- ------------------------------------------------------------
-- 2. Anon privilege reduction (hardening, no behavioural change:
--    every revoked operation was already denied to anon by RLS.)
--
-- NOTE on PostgreSQL privilege semantics: column-level grants are
-- ADDITIVE to table-level grants — they never narrow a table-level
-- privilege. Column scoping is therefore achieved by revoking the
-- table-level privilege first and granting the INSERT column list.
-- For reviews the public SELECT is explicitly re-granted at
-- table level (the is_visible policy keeps reads to hotspot content).
-- ------------------------------------------------------------
REVOKE ALL ON public.admin_users      FROM anon;
REVOKE ALL ON public.registrations    FROM anon;
REVOKE ALL ON public.pay_play_bookings FROM anon;

REVOKE ALL ON public.reviews FROM anon;
GRANT SELECT ON public.reviews TO anon;   -- RLS policy limits to is_visible = true

-- TARGETED PUBLIC hardening (reviewer point 2): revoke from PUBLIC
-- only on the four tables this design touches — never database-wide.
-- On stock Supabase, bootstrap privileges go to the named roles
-- (anon/authenticated/service_role), so these are normally no-ops;
-- but anon INHERITS every privilege held by PUBLIC, so if the live
-- environment ever received a PUBLIC grant (verify with GROUP G1
-- before applying), this closes the bypass a pure anon revoke would
-- leave open. authenticated keeps its own (default/proactive) grants;
-- service_role is untouched.
REVOKE ALL ON public.admin_users       FROM PUBLIC;
REVOKE ALL ON public.registrations     FROM PUBLIC;
REVOKE ALL ON public.pay_play_bookings FROM PUBLIC;
REVOKE ALL ON public.reviews           FROM PUBLIC;
-- Sequences: none of the four tables use serial/sequence defaults
-- (every id is uuid_generate_v4()); GROUP G5 of the verification
-- suite confirms live sequence grants before anything is revoked.

DO $$
DECLARE
  v_table text;
  v_canonical text[];      -- the columns a guest submission may set
  v_existing text[];       -- intersection actually present in prod
  v_missing  text[];       -- canonical columns absent from prod
  v_col text;
  v_skipped text;
BEGIN
  -- (table, canonical guest columns) triple
  FOR v_table IN SELECT unnest(ARRAY['registrations','pay_play_bookings','reviews'])
  LOOP
    v_canonical := CASE v_table
      WHEN 'registrations' THEN
        ARRAY['full_name','age','phone','email','city','interested_range','experience','message']
      WHEN 'pay_play_bookings' THEN
        ARRAY['full_name','phone','email','city','experience_level','session_id',
              'preferred_date','preferred_time','message']
      WHEN 'reviews' THEN
        ARRAY['author_name','rating','review_title','review_text']
      ELSE
        NULL
    END;

    v_existing := ARRAY[]::text[];
    v_missing  := ARRAY[]::text[];
    FOREACH v_col IN ARRAY v_canonical LOOP
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = v_table
          AND column_name  = v_col
      ) THEN
        v_existing := array_append(v_existing, v_col);
      ELSE
        v_missing := array_append(v_missing, v_col);
      END IF;
    END LOOP;

    -- FAIL CLOSED (reviewer point 4): a missing canonical column is a
    -- migration-order error, not a warning condition. Granting an
    -- incomplete INSERT list would silently break the corresponding
    -- guest form (PGRST204) or, worse, desync the privilege model from
    -- the application. Raise and abort instead: when applied through
    -- the migration runner (single transaction, migration 12 last in
    -- the chain) the exception rolls back everything this file ran —
    -- including the REVOKE/GRANT statements above — so the database is
    -- left in its pre-apply state and NOTHING is granted partially.
    IF array_length(v_missing, 1) > 0 THEN
      RAISE EXCEPTION
        'Migration 12 ABORTED: missing canonical guest column(s) % on %.%. '
        'Expected columns come from the live frontend payloads (RegistrationPage.js allowedFields, PayPlaySessionPage.jsx submit payload, ReviewForm.js payload); '
        'apply the dependency chain first (registrations.experience + booking guest columns: 20261024210000; reviews.review_title: 20261023120000), '
        'then re-run this migration from scratch.',
        array_to_string(v_missing, ', '), 'public', v_table;
    END IF;

    SELECT string_agg(c, ', ') INTO v_skipped FROM unnest(v_existing) AS e(c);
    IF v_skipped IS NULL THEN
      -- Unreachable after the fail-closed loop above (a NULL
      -- intersection implies every column was missing, which already
      -- raised); kept as a last-resort guard so no empty GRANT column
      -- list can ever be generated.
      RAISE EXCEPTION 'migration 12 aborted: no canonical guest column exists on %.% — grant skipped rather than executed empty', 'public', v_table;
    ELSE
      EXECUTE format('GRANT INSERT (%s) ON public.%I TO anon', v_skipped, v_table);
      RAISE NOTICE '%: anon INSERT granted on % column(s): %', v_table, array_length(v_existing, 1), v_skipped;
    END IF;
  END LOOP;
END $$;

-- ------------------------------------------------------------
-- 3. admin_users: minimal, self-contained access policy (F-16)
--    Own-row SELECT only; NO INSERT/UPDATE/DELETE policies for
--    anon/authenticated. Account administration stays manual
--    (same behavioural model as today — the app has no account
--    management UI; provisioning happens by operators in SQL).
--    Idempotent: policies with these exact names are absent first.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admin select own account" ON public.admin_users;
CREATE POLICY "Admin select own account"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- SELF-SERVICE UPDATE: deliberately NONE (reviewer point 1).
-- Evidence base:
--   * admin_users columns: id, email, full_name, role, is_active,
--     last_login, created_at, updated_at — every writable column is
--     privileged (role/is_active gate the whole admin system).
--   * The ONLY frontend consumer is src/lib/admin-auth.ts
--     getAdminRole(): an own-row SELECT
--     (?id=eq.<uid>&select=role,is_active) driving the route guard.
--     No code path ever updates admin_users, and there is no
--     admin-users management UI.
--   * The earlier "immutable is_active/role" WITH CHECK formulation
--     was invalid SQL anyway: RLS WITH CHECK is evaluated against the
--     post-trigger NEW row; OLD is not referenceable there.
-- With RLS ENABLED and NO UPDATE policy, an authenticated UPDATE
-- matches zero rows (RLS default-deny for the command) — so NOBODY
-- (admin, editor, viewer) can modify any admin_users row over the
-- API, including their own. Self-promotion, self-reactivation and
-- cross-account modification are structurally impossible, not merely
-- filtered. Account administration stays an operator task executed
-- under a privileged role.
-- Defence in depth: Supabase's default privileges leave table-level
-- INSERT/UPDATE/DELETE on authenticated; revoke the write commands so
-- requests fail at the privilege layer before RLS is even consulted.
-- SELECT is retained for the route guard. service_role is untouched
-- (bypasses RLS and is not reachable from the browser).
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.admin_users FROM authenticated;
-- Self-healing for any earlier application of this migration in its
-- prior (invalid WITH CHECK) form: remove the dead policy name.
DROP POLICY IF EXISTS "Admin update own account" ON public.admin_users;

-- ------------------------------------------------------------
-- 3b. Function EXECUTE hygiene — targeted PUBLIC default removal.
--     PostgreSQL grants EXECUTE to PUBLIC by default on every new
--     function (proacl NULL == "EXECUTE to PUBLIC"). For these
--     functions the explicit grants below MUST accompany the PUBLIC
--     revoke: RLS policy expressions evaluate the role helpers AS
--     the querying role, so revoking PUBLIC without re-granting the
--     API roles would break every admin policy. Granting explicitly
--     to anon/authenticated/service_role preserves today's effective
--     behaviour exactly while removing the blanket PUBLIC default.
-- ------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.is_active_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_admin_write() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_active_admin() TO anon, authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.can_admin_write() TO anon, authenticated, service_role;

-- The audit RPC is admin-only: anonymous callers must not even reach
-- it (the function body re-validates the caller, but the privilege
-- layer is the first line). authenticated keeps the explicit EXECUTE
-- granted by 20261030000000; service_role keeps its namespace access.
-- The guest-state/notify trigger functions (RETURNS TRIGGER) cannot
-- be invoked through PostgREST RPC at all and keep their defaults.
REVOKE EXECUTE ON FUNCTION public.log_admin_action FROM PUBLIC, anon;

-- ------------------------------------------------------------
-- 4. Post-apply verification (read-only):
--
--    A. Trigger/policy agree on source
--       SELECT pg_get_functiondef('public.enforce_guest_registration_state()'::regprocedure);
--       -- body must contain: NEW.source = 'website'
--
--    A2. admin_users policy model (F-16)
--       SELECT policyname, cmd, roles, qual, with_check
--       FROM pg_policies
--       WHERE schemaname='public' AND tablename='admin_users';
--       -- must contain EXACTLY ONE policy: "Admin select own account"
--       -- (SELECT, TO authenticated, USING id = auth.uid()).
--       -- NO UPDATE policy exists — with RLS on and no UPDATE policy,
--       -- no API role can modify admin_users (self-promotion,
--       -- self-reactivation and cross-account writes all fail);
--       -- NO INSERT and NO DELETE policy either. Any additional
--       -- pre-existing broader policy found here must be reviewed
--       -- by the operator at Stage 3 (permissive policies OR-combine).
--
--    B. Effective anon privileges
--       SELECT table_name, privilege_type
--       FROM information_schema.role_table_grants
--       WHERE grantee = 'anon'
--         AND table_name IN ('admin_users','registrations','pay_play_bookings','reviews')
--       ORDER BY table_name, privilege_type;
--       -- admin_users/registrations/pay_play_bookings: ZERO rows expected
--       -- reviews: SELECT + INSERT expected (table-level), nothing else
--
--    C. Column-level INSERT scope
--       SELECT table_name, column_name
--       FROM information_schema.column_privileges
--       WHERE grantee = 'anon' AND privilege_type = 'INSERT'
--         AND table_name IN ('registrations','pay_play_bookings','reviews')
--       ORDER BY table_name, column_name;
--       -- exactly the canonical lists above; anything else fails this check
--
--    D. API probes (anon key PostgREST, NOT SQL editor):
--       POST /rest/v1/registrations  {"full_name":"probe","email":"p@e.com",
--         "source":"admin"}                          → 4xx (policy/privilege)
--       POST /rest/v1/registrations  {"full_name":"probe","email":"p@e.com"}  
--                                                  → 201, source='website'
--       POST /rest/v1/reviews        {"author_name":"probe",
--         "review_text":"probe","rating":5,
--         "is_visible":true}                          → 4xx
-- ------------------------------------------------------------
-- ROLLBACK (parameter reference, do not run in prod):
--   -- restore pre-Phase-6 trigger body from 20261024210000
--   CREATE OR REPLACE FUNCTION public.enforce_guest_registration_state() ...;
--   DROP POLICY IF EXISTS "Public insert guest registrations" ON public.registrations;
--   CREATE POLICY "Public insert guest registrations" ON public.registrations
--     FOR INSERT TO anon WITH CHECK (status = 'new' AND admin_notes IS NULL);
--   -- restore anon table-level ALL (Supabase default):
--   GRANT ALL ON public.admin_users, public.registrations,
--                public.pay_play_bookings, public.reviews TO anon;
--   -- (RLS still denies the restored privileges to anon today)
--   -- F-16 rollback: DROP POLICY IF EXISTS "Admin select own account"
--   --   ON public.admin_users; — there is no UPDATE policy anymore.
--   --   Re-granting write commands if the rollback requires the
--   --   pre-hardening environment: GRANT INSERT, UPDATE, DELETE,
--   --   TRUNCATE ON public.admin_users TO authenticated;
--   --   (returns admin_users to the prior environment-specific state;
--   --    re-verify the login flow immediately after)
-- ------------------------------------------------------------
