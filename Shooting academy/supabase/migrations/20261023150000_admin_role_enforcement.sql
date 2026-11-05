-- ============================================================
-- Admin Role Enforcement (P1 security hardening)
-- ============================================================
-- PROBLEM: every table's admin policy checks only
--     EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active)
-- Any is_active admin row grants FULL WRITE access to every table,
-- regardless of the `role` column. A compromised or demoted account
-- (role = 'viewer') keeps full create/update/delete powers.
--
-- FIX: split the blanket FOR ALL policies into:
--   - READ  (SELECT): allowed for admin, editor, AND viewer
--   - WRITE (INSERT/UPDATE/DELETE): allowed only for admin + editor
--
-- In-place repair script. Delete-on-replace accounts with a data-drop
-- are NOT required; migrate via: supabase db push (or SQL editor).
--
-- IMPORTANT: run by an operator with elevated privileges. If applied
-- through the SQL editor, service-role context bypasses RLS; afterwards
-- browser sessions rely on their own admin_users row. Existing admin
-- rows need role IN ('admin','editor') to retain write access.
-- ============================================================

-- Helper: is the current user an active admin_users row at all?
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

-- Helper: is the current user an active admin_users row with write role?
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

-- ============================================================
-- Swap every blanket "Admin full access ..." policy
-- ============================================================
-- For each content table: drop FOR ALL policy, add SELECT policy and a
-- write policy. Idempotent: DROP POLICY IF EXISTS + CREATE guarded.

DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'academy_content',
        'training_ranges',
        'coaches',
        'facilities',
        'achievements',
        'gallery_images',
        'reviews',
        'registrations',
        'pay_play_options',
        'motivational_quotes',
        'contact_settings',
        'site_section_settings',
        'pay_play_bookings'
    ] LOOP
        -- The original policies name the table with spaces
        -- ("Admin full access academy content", "Admin full access gallery
        -- images", ...). Drop BOTH naming variants so re-runs and future
        -- `supabase db push` always clean up, then recreate the pair.
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Admin full access ' || replace(t, '_', ' '), t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Admin full access ' || t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Admin select ' || t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Admin write ' || t, t);

        EXECUTE format($f$
            CREATE POLICY "Admin select %I" ON %I
            FOR SELECT USING (public.is_active_admin())
        $f$, t, t);

        EXECUTE format($f$
            CREATE POLICY "Admin write %I" ON %I
            FOR ALL USING (public.can_admin_write())
            WITH CHECK (public.can_admin_write())
        $f$, t, t);
    END LOOP;
END;
$$;

-- ============================================================
-- Straighten the pay_play_bookings / registrations public INSERT
-- policies (kept, but tightened against abuse elsewhere; no change).
-- ============================================================

COMMENT ON FUNCTION public.is_active_admin() IS 'RLS helper: active admin_users row for auth.uid()';
COMMENT ON FUNCTION public.can_admin_write() IS 'RLS helper: active admin_users row with role admin or editor';
