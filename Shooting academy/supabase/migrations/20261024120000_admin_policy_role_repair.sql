-- ============================================================
-- Admin Role Enforcement REPAIR (targeted, idempotent)
-- ============================================================
-- Follow-up to 20261023150000_admin_role_enforcement.sql.
--
-- WHY THIS EXISTS: the first run swapped the policies on the 5
-- single-word tables (coaches, facilities, achievements, reviews,
-- registrations), but missed the 8 remaining tables because the
-- original schema names them with SPACES:
--   "Admin full access academy content"      ON academy_content
--   "Admin full access training ranges"      ON training_ranges
--   "Admin full access gallery images"       ON gallery_images
--   "Admin full access pay play options"     ON pay_play_options
--   "Admin full access motivational quotes"  ON motivational_quotes
--   "Admin full access contact settings"     ON contact_settings
--   "Admin full access site section settings" ON site_section_settings
--   "Admin full access pay play bookings"    ON pay_play_bookings
--
-- CONFIRMED RISK ON THE 8 TABLES (as-is):
--   - The old FOR ALL policy still fires, so any is_active admin_users
--     row — INCLUDING role = 'viewer' — keeps full
--     INSERT/UPDATE/DELETE on all eight tables.
--   - Not exploitable by the public: expression requires auth.uid()
--     to match an active admin_users row, so anon/statless callers
--     (and therefore the website visitors) are still denied writes.
--   - No new policy was dropped or weakened; the "Public read/insert"
--     policies are untouched.
--
-- FIX (this file, idempotent): for exactly those 8 tables, drop the
-- old spaced-name FOR ALL policy AND any pre-existing Admin select/
-- write pair, then recreate the two-policy model used by the other 5:
--   SELECT                -> public.is_active_admin()   (admin|editor|viewer)
--   INSERT/UPDATE/DELETE  -> public.can_admin_write()   (admin|editor only)
--
-- Safe to run more than once. Requires the two helper functions from
-- 20261023150000 to exist (they do — verified live).
-- ============================================================

DO $$
DECLARE
    rec record;
BEGIN
    FOR rec IN
        SELECT * FROM (VALUES
            ('academy_content',        'Admin full access academy content'),
            ('training_ranges',        'Admin full access training ranges'),
            ('gallery_images',         'Admin full access gallery images'),
            ('pay_play_options',       'Admin full access pay play options'),
            ('motivational_quotes',    'Admin full access motivational quotes'),
            ('contact_settings',       'Admin full access contact settings'),
            ('site_section_settings',  'Admin full access site section settings'),
            ('pay_play_bookings',      'Admin full access pay play bookings')
        ) AS v(t, old_policy)
    LOOP
        -- Drop the legacy blanket policy (exact spaced name).
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', rec.old_policy, rec.t);
        -- Drop underscore-name variants in case a retry created them.
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Admin full access ' || rec.t, rec.t);
        -- Drop and recreate the role-enforced pair (keeps naming uniform
        -- with the 5 tables already migrated).
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
END;
$$;

-- ============================================================
-- Verification (run separately after applying):
--   SELECT tablename, policyname, cmd
--   FROM pg_policies
--   WHERE schemename = 'public'
--     AND (  policyname LIKE 'Admin select %'
--         OR policyname LIKE 'Admin write %'
--         OR policyname LIKE 'Admin full access %' )
--   ORDER BY tablename, cmd;
-- Expected: 13 tables, each with exactly one "Admin select" (cmd=SELECT)
-- and one "Admin write" (cmd=ALL); zero "Admin full access" rows left.
--
-- SELECT proname FROM pg_proc
-- WHERE pronamespace = 'public'::regnamespace
--   AND proname IN ('is_active_admin','can_admin_write');  -- 2 rows
-- ============================================================
