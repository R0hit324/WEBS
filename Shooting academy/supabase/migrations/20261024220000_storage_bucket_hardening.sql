-- ============================================================
-- 2026-10-24 — Phase 4: Storage bucket hardening (VUL-005)
--
-- Server-side counterpart to the client upload hardening now in
-- src/lib/admin-api.ts (magic-byte sniffing, 5 MB cap, Content-Type
-- taken from the sniffed type, object path extensions derived from
-- the sniffed type, SVG rejected client-side).
--
-- This migration sets the STORAGE-ENFORCED limits on every image
-- bucket used by the admin modules (lib/supabase.ts STORAGE_BUCKETS):
--   gallery, coaches, achievements, facilities, academy, uploads,
--   training
--   - file_size_limit      5 MB, matching the client cap
--   - allowed_mime_types   image/jpeg, image/png, image/gif, image/webp
--     (SVG is NOT in the list: uploaded SVG can carry script and is
--      executed on direct navigation — stored XSS via the public URL)
--
-- Supabase Storage enforces these attributes at upload time
-- (HTTP 422 on violation), independent of any client behaviour, so
-- even a hand-crafted request bypassing the UI cannot store SVG or
-- oversize files in these buckets.
--
-- Reversible: run the UPDATE again with the old values (or NULL).
--
-- The bucket names actually present in the project are
-- verified first; missing ones are reported via NOTICE (idempotent,
-- safe to re-run).
--
-- NOTE: this file only touches storage.buckets attributes. It does
-- NOT create/modify storage.objects RLS policies — current prod
-- policies must be reviewed separately (diagnostic query in the
-- NOTES section at the bottom).
-- ============================================================

DO $$
DECLARE
  v_target text[] := ARRAY['gallery','coaches','achievements','facilities','academy','uploads','training'];
  v_missing text;
  v_rows_updated integer;
BEGIN
  SELECT string_agg(id, ', ')
    INTO v_missing
  FROM unnest(v_target) AS t(id)
  WHERE NOT EXISTS (SELECT 1 FROM storage.buckets b WHERE b.id = t.id);

  IF v_missing IS NOT NULL THEN
    RAISE NOTICE 'buckets not present (skipped): %', v_missing;
  END IF;

  UPDATE storage.buckets
  SET file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg','image/png','image/gif','image/webp']
  WHERE id = ANY(v_target);

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  RAISE NOTICE 'bucket hardening applied to % bucket(s)', v_rows_updated;
END $$;

-- Undo reference (do not run in prod):
--   UPDATE storage.buckets
--   SET file_size_limit = NULL, allowed_mime_types = NULL
--   WHERE id IN ('gallery','coaches','achievements','facilities',
--                'academy','uploads','training');

-- ------------------------------------------------------------
-- DIAGNOSTIC (run in Studio SQL editor, read-only):
--
--   SELECT id,
--          file_size_limit,
--          allowed_mime_types,
--          public
--   FROM storage.buckets
--   ORDER BY id;
--
--   -- Audit who can touch storage objects today:
--   SELECT schemaname, tablename, policyname, cmd,
--          roles, qual, with_check
--   FROM pg_policies
--   WHERE schemaname = 'storage'
--   ORDER BY tablename, policyname;
--
-- Expected after this migration:
--   everything in v_target with the 5 MB limit and the 4-type list;
--   the 'storage' policies listing is for review in the phase report.
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- NOTES
--  * After applying, storage rejects oversize/MIME-violating uploads
--    with 422 even if the request is crafted directly (no client
--    trusted anymore).
--  * Keep ImageMagick-equivalent server-side transcoding OFF for SVG;
--    if SVG ever becomes a business need it must go through a
--    sanitizer (DOMPurify server-side) into a separate sandboxed
--    bucket with a restrictive CSP — out of scope here.
--  * Client already rejects the same formats with friendly errors
--    (admin-api.ts prepareImageUpload), so admins see a clear message
--    instead of a raw 422.
-- ------------------------------------------------------------
