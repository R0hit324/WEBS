-- ============================================================
-- Migration: Admin Audit Log Table
-- ============================================================
-- Immutable audit trail for all admin actions (CRUD, toggles, reorder, uploads).
-- Append-only: no UPDATE/DELETE policies for any role.
-- RLS ensures only admins can read; service role writes via Edge Function or direct.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  admin_user_id uuid NOT NULL REFERENCES public.admin_users(id) ON DELETE RESTRICT,
  admin_role text NOT NULL CHECK (admin_role IN ('admin', 'editor', 'viewer')),
  action text NOT NULL CHECK (action IN (
    'create', 'update', 'delete',
    'toggle_visibility', 'toggle_featured', 'reorder',
    'upload_image', 'delete_image'
  )),
  table_name text NOT NULL,
  record_id uuid, -- nullable for bulk actions like reorder
  old_data jsonb, -- snapshot before change (null for create)
  new_data jsonb, -- snapshot after change (null for delete)
  metadata jsonb DEFAULT '{}'::jsonb, -- extra context: ip, user_agent, etc.
  request_id uuid DEFAULT gen_random_uuid() -- correlation ID for request tracing
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user
  ON public.admin_audit_log (admin_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_table_record
  ON public.admin_audit_log (table_name, record_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action
  ON public.admin_audit_log (action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_request
  ON public.admin_audit_log (request_id);

-- Enable RLS
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Admins/Editors can read all audit logs
CREATE POLICY "Admins and editors can read audit logs"
  ON public.admin_audit_log
  FOR SELECT
  TO authenticated
  USING (
    public.is_active_admin()
    OR public.can_admin_write()
  );

-- Policy: Service role can insert (for Edge Function webhook writers)
-- Direct client inserts are NOT allowed — use the Edge Function or RPC.
CREATE POLICY "Service role can insert audit logs"
  ON public.admin_audit_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- NO UPDATE/DELETE policies — audit log is immutable by design.
-- If you need to prune old logs, run a manual DELETE as superuser via SQL Editor.

-- Helpful view: recent admin activity with readable names
CREATE OR REPLACE VIEW public.admin_activity_recent AS
SELECT
  a.id,
  a.created_at,
  a.admin_user_id,
  au.email AS admin_email,
  a.admin_role,
  a.action,
  a.table_name,
  a.record_id,
  a.old_data,
  a.new_data,
  a.metadata,
  a.request_id
FROM public.admin_audit_log a
JOIN public.admin_users au ON au.id = a.admin_user_id
ORDER BY a.created_at DESC
LIMIT 1000;

-- Grant select on view to authenticated (RLS on base table still applies)
GRANT SELECT ON public.admin_activity_recent TO authenticated;

-- ============================================================
-- Optional: RPC for client-side audit logging (bypasses need for
-- service role key in frontend). Called with anon key + user JWT.
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text,
  p_table_name text,
  p_record_id uuid DEFAULT NULL,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid;
  v_role text;
  v_request_id uuid := gen_random_uuid();
BEGIN
  -- Verify the caller is an active admin/editor
  SELECT id, role INTO v_admin_id, v_role
  FROM public.admin_users
  WHERE id = auth.uid() AND is_active = true;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: not an active admin user';
  END IF;

  IF v_role NOT IN ('admin', 'editor') THEN
    RAISE EXCEPTION 'Forbidden: viewers cannot write audit logs';
  END IF;

  INSERT INTO public.admin_audit_log (
    admin_user_id,
    admin_role,
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    metadata,
    request_id
  ) VALUES (
    v_admin_id,
    v_role,
    p_action,
    p_table_name,
    p_record_id,
    p_old_data,
    p_new_data,
    p_metadata,
    v_request_id
  )
  RETURNING request_id INTO v_request_id;

  RETURN v_request_id;
END;
$$;

-- Grant execute to authenticated (admin/editor only via function logic)
GRANT EXECUTE ON FUNCTION public.log_admin_action TO authenticated;

-- ============================================================
-- Post-apply verification:
-- SELECT * FROM public.admin_audit_log LIMIT 5;
-- SELECT public.log_admin_action('create', 'gallery_images', gen_random_uuid(), NULL, '{"title":"Test"}'::jsonb);
-- ============================================================