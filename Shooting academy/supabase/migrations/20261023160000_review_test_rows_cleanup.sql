-- ============================================================
-- Review test-row cleanup (P1 data hygiene)
-- ============================================================
-- Deletes 3 leftover integration-test reviews that are currently
-- approved & publicly visible on the site:
--   1. 60bcbc3f-4472-485e-9e48-573053f68fcf   (Test Shooter, 4 stars)
--   2. de4901b8-4206-4bfb-be9c-882b5fcb564a   (Test Shooter, 4 stars)
--   3. 6325c323-4fa8-4f7d-95bb-5a82f57e3408   (kjbdsfjksbd,  2 stars)
--
-- Idempotent and self-limiting: only rows with exactly these UUIDs and
-- an obviously dummy author are removed, so real guest reviews can
-- never be lost. Nothing else is touched.
-- ============================================================

DELETE FROM public.reviews
WHERE id = '60bcbc3f-4472-485e-9e48-573053f68fcf'
  AND author_name = 'Test Shooter';

DELETE FROM public.reviews
WHERE id = 'de4901b8-4206-4bfb-be9c-882b5fcb564a'
  AND author_name = 'Test Shooter';

DELETE FROM public.reviews
WHERE id = '6325c323-4fa8-4f7d-95bb-5a82f57e3408'
  AND author_name = 'kjbdsfjksbd';
