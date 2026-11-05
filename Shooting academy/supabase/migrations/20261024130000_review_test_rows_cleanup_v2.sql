-- ============================================================
-- Review test-row cleanup v2 (targeted, idempotent)
-- ============================================================
-- Follow-up to 20261023160000_review_test_rows_cleanup.sql.
--
-- CONTEXT: after the earlier cleanup removed the 3 originally known
-- test UUIDs, newer leftovers from past integration-test runs remain
-- publicly visible (is_visible = true). All four share the same
-- fingerprint: author_name = 'Test Shooter', rating = 4,
-- review_date IS NULL (inserted before the 2026-10-23 12:00 guest-state
-- trigger existed), display_order = 0, review_title NULL.
--
--   c5e54088-0a59-4859-bb01-33ff0cc8fcb5   (updated 2026-10-24 12:04 UTC)
--   37403d11-2b92-4e5d-9518-f9c679dec953   (updated 2026-10-24 12:04 UTC)
--   5d00270e-ab8d-4f82-adbf-8634d851c7a1   (updated 2026-10-24 12:04 UTC)
--   191fd6ed-bedc-42a2-bd83-e9524991999b   (updated 2026-10-24 12:04 UTC)
--
-- Self-limiting: matches BOTH the exact UUID and the fingerprint above,
-- so a real guest review can never be caught by a race.
-- ============================================================

DELETE FROM public.reviews
WHERE id IN (
    'c5e54088-0a59-4859-bb01-33ff0cc8fcb5',
    '37403d11-2b92-4e5d-9518-f9c679dec953',
    '5d00270e-ab8d-4f82-adbf-8634d851c7a1',
    '191fd6ed-bedc-42a2-bd83-e9524991999b'
)
  AND author_name = 'Test Shooter'
  AND rating = 4
  AND review_date IS NULL;
