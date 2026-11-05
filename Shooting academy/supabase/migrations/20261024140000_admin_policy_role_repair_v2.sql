-- ============================================================
-- Admin Role Enforcement REPAIR v2 (targeted, idempotent, self-verifying)
-- ============================================================
-- Supersedes 20261024120000_admin_policy_role_repair.sql (v1). v1's
-- statement generation was correct (format + %I yields the exact spaced
-- policy names), but it completed without any output stating what it had
-- actually changed — so a "Success" command tag gave no evidence that the
-- DROPs had really happened in the queried database. v2 closes that gap:
--
--   1. HARD sanity gates (explicit exceptions before touching anything):
--        - the two helper functions must exist,
--        - each target table must exist;
--        (an ownership mismatch is only WARNed about — diagnostic;
--         the self-check in 4 is the actual safeguard.)
--   2. Drops ONLY these 8 exact legacy policy names (and underscore-name
--      variants), per table:
--        "Admin full access academy content"        ON public.academy_content
--        "Admin full access training ranges"        ON public.training_ranges
--        "Admin full access gallery images"         ON public.gallery_images
--        "Admin full access pay play options"       ON public.pay_play_options
--        "Admin full access motivational quotes"    ON public.motivational_quotes
--        "Admin full access contact settings"       ON public.contact_settings
--        "Admin full access site section settings"  ON public.site_section_settings
--        "Admin full access pay play bookings"      ON public.pay_play_bookings
--   3. Recreates the two-policy model per table (uniform with the 5
--      tables already migrated):
--        "Admin select <table>"  FOR SELECT      USING (is_active_admin())   — read for admin|editor|viewer
--        "Admin write <table>"   FOR ALL         USING (can_admin_write())
--                                WITH CHECK      (can_admin_write())         — write for admin|editor only
--   4. AFTER the loop, re-inventories pg_policies FOR THE 8 TARGET
--      TABLES ONLY (both spaced and underscore name variants):
--        - any surviving legacy policy raises an EXCEPTION
--          (the whole script rolls back — no silent "success" is possible),
--        - a legacy-named policy on some OTHER table must NOT block
--          this repair, so the check is table-scoped, not schema-wide,
--        - otherwise a NOTICE prints the final inventory.
--   5. Untouched: the 5 already-migrated tables' existing select/write
--      pairs, every "Public read/insert" policy, all triggers/functions
--      except the two helpers (recreated idempotently if absent).
--
-- Safe to run repeatedly. No data is read or written beyond catalog
-- metadata. Not exploitable publicly either before or after: legacy AND
-- new admin expressions require a matching admin_users row (auth.uid()).
-- ============================================================

-- ------------------------------------------------------------
-- 0) Idempotent helpers (no-ops when already present)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE admin_users.id = auth.uid()
          AND admin_users.is_active = true
          AND admin_users.role IN ('admin', 'editor')
    );
$$;

-- ------------------------------------------------------------
-- 1) The repair itself, with hard gates and a self-report
-- ------------------------------------------------------------
DO $repair$
DECLARE
    rec             record;
    v_tables_missing text;
    v_not_owner     text;
    v_legacy_left   text;
    v_legacy_count  int;
BEGIN
    -- Gate A: helpers must be present (they were just Create-or-replaced;
    -- this also catches a session/role that cannot create functions).
    IF NOT EXISTS (SELECT 1 FROM pg_proc
                   WHERE pronamespace = 'public'::regnamespace
                     AND proname = 'can_admin_write') THEN
        RAISE EXCEPTION 'GATE FAILED: public.can_admin_write() unavailable in this database';
    END IF;

    -- Gate B: every target table exists in THIS database.
    SELECT string_agg(t, ', ')
      INTO v_tables_missing
      FROM (VALUES
        ('academy_content'), ('training_ranges'), ('gallery_images'),
        ('pay_play_options'), ('motivational_quotes'), ('contact_settings'),
        ('site_section_settings'), ('pay_play_bookings')
      ) AS v(t)
     WHERE to_regclass('public.' || t) IS NULL;
    IF v_tables_missing IS NOT NULL THEN
        RAISE EXCEPTION 'GATE FAILED: table(s) missing from this database: %', v_tables_missing;
    END IF;

    -- Gate C (DIAGNOSTIC ONLY, not a safeguard): warns if the SQL-editor
    -- session role does not own the tables, because a non-owner may be
    -- denied DROP POLICY (the failure mode behind the "success but
    -- unchanged" symptom). The authoritative safeguard that a silent
    -- no-op cannot pass is the self-check AFTER the loop below, which
    -- raises an EXCEPTION (full rollback) if any legacy policy remains.
    SELECT string_agg(schemaname || '.' || tablename, ', ')
      INTO v_not_owner
      FROM pg_tables
     WHERE schemaname = 'public'
       AND tablename IN ('academy_content','training_ranges','gallery_images',
                         'pay_play_options','motivational_quotes','contact_settings',
                         'site_section_settings','pay_play_bookings')
       AND tableowner NOT IN (current_user, 'postgres', 'supabase_admin');
    IF v_not_owner IS NOT NULL THEN
        RAISE WARNING 'GATE WARNING: these tables are not owned by postgres/supabase_admin/current_user: %', v_not_owner;
        RAISE WARNING '=> DROP POLICY may be denied for this role. If the script errors next, run it as the table owner (Supabase Dashboard SQL Editor uses postgres).';
    END IF;

    -- Snapshot of legacy rows before the work (surfaced at the end).
    SELECT count(*) INTO v_legacy_count
      FROM pg_policies
     WHERE schemaname = 'public' AND policyname LIKE 'Admin full access %';

    -- The repair loop: 8 tables only.
    FOR rec IN
        SELECT t, old_policy FROM (VALUES
            ('academy_content',       'Admin full access academy content'),
            ('training_ranges',       'Admin full access training ranges'),
            ('gallery_images',        'Admin full access gallery images'),
            ('pay_play_options',      'Admin full access pay play options'),
            ('motivational_quotes',   'Admin full access motivational quotes'),
            ('contact_settings',      'Admin full access contact settings'),
            ('site_section_settings', 'Admin full access site section settings'),
            ('pay_play_bookings',     'Admin full access pay play bookings')
        ) AS v(t, old_policy)
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', rec.old_policy, rec.t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Admin full access ' || rec.t, rec.t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Admin select ' || rec.t, rec.t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Admin write ' || rec.t, rec.t);

        EXECUTE format($f$
            CREATE POLICY %I ON %I
            FOR SELECT USING (public.is_active_admin())
        $f$, 'Admin select ' || rec.t, rec.t);

        EXECUTE format($f$
            CREATE POLICY %I ON %I
            FOR ALL USING (public.can_admin_write())
            WITH CHECK (public.can_admin_write())
        $f$, 'Admin write ' || rec.t, rec.t);
    END LOOP;

    -- Self-verification: hard-fail instead of silently "succeeding".
    -- Scope is deliberately LIMITED to the 8 target tables (this is the
    -- authoritative safeguard Gate C is not): both the spaced legacy
    -- names and the underscore variants. A legacy-named policy on ANY
    -- OTHER table must not block this repair, so no schema-wide clause.
    SELECT count(*), coalesce(string_agg(p.policyname || '@' || p.tablename, ' | '), '')
      INTO v_legacy_count, v_legacy_left
      FROM (VALUES
            ('academy_content',       'Admin full access academy content'),
            ('training_ranges',       'Admin full access training ranges'),
            ('gallery_images',        'Admin full access gallery images'),
            ('pay_play_options',      'Admin full access pay play options'),
            ('motivational_quotes',   'Admin full access motivational quotes'),
            ('contact_settings',      'Admin full access contact settings'),
            ('site_section_settings', 'Admin full access site section settings'),
            ('pay_play_bookings',     'Admin full access pay play bookings')
        ) AS v(t, spaced)
        JOIN pg_policies p
          ON p.schemaname = 'public'
         AND p.tablename = v.t
     WHERE p.policyname = v.spaced
        OR p.policyname = 'Admin full access ' || v.t;

    IF v_legacy_count > 0 THEN
        RAISE EXCEPTION 'REPAIR DID NOT TAKE EFFECT in this database: % legacy policy(ies) still present: %', v_legacy_count, v_legacy_left;
    END IF;

    RAISE NOTICE 'REPAIR OK: dropped % legacy "Admin full access" policy(ies) and (re)created 8 "Admin select" + 8 "Admin write" policies with can_admin_write() in USING and WITH CHECK', v_legacy_count;
    RAISE NOTICE 'If you see FEWER than 8 dropped here, please re-check exactly which database/connection this script ran on (branching / dashboard SQL editor).';
END;
$repair$;

-- ------------------------------------------------------------
-- 2) Immediate, copy-pasteable verification (must be run in the SAME
--    database/session right after the block). Expected result for the
--    8 tables: exactly one "Admin select ..." row (cmd = SELECT,
--    with_check NULL) and one "Admin write ..." row (cmd = ALL,
--    qual = can_admin_write(), with_check = can_admin_write()).
--    And across the whole schema: ZERO rows named 'Admin full access %'.
--    The other 5 tables (coaches, facilities, achievements, reviews,
--    registrations) already had their pairs — verify them too below.
-- ------------------------------------------------------------
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND (  policyname LIKE 'Admin select %'
      OR policyname LIKE 'Admin write %'
      OR policyname LIKE 'Admin full access %' )
ORDER BY tablename, cmd;
