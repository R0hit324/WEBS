-- ============================================================
-- 2026-10-23 — Public "Write a Review" submissions (moderated)
--
-- Purpose: let anonymous visitors submit reviews from the public
-- website. Submissions are stored as PENDING (is_visible = false)
-- so they never appear publicly until an admin approves them with
-- the existing admin Reviews module (toggle "Visible").
--
-- Safe to re-run (all statements guarded).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Optional display title submitted by visitors
-- ------------------------------------------------------------
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS review_title TEXT;

-- ------------------------------------------------------------
-- 2. Length guards for guest-supplied text.
--    The form enforces these limits client-side; the database is
--    the last line of defence. The constraints are added NOT VALID so
--    pre-existing rows can never make the migration fail; they are
--    enforced for every NEW insert/update, and a best-effort VALIDATE
--    (below, in its own guarded block) checks the old rows afterwards.
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_review_text_len') THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_review_text_len
      CHECK (char_length(review_text) BETWEEN 1 AND 1000) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_author_name_len') THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_author_name_len
      CHECK (char_length(author_name) <= 80) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_review_title_len') THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_review_title_len
      CHECK (review_title IS NULL OR char_length(review_title) <= 120) NOT VALID;
  END IF;
END $$;

-- Best-effort validation of the pre-existing rows: never aborts the
-- migration. If an old row is oversized you'll see a NOTICE with the
-- reason and can decide how to handle that row manually.
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.reviews VALIDATE CONSTRAINT reviews_review_text_len;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'VALIDATE reviews_review_text_len skipped: %', SQLERRM; END;
  BEGIN
    ALTER TABLE public.reviews VALIDATE CONSTRAINT reviews_author_name_len;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'VALIDATE reviews_author_name_len skipped: %', SQLERRM; END;
  BEGIN
    ALTER TABLE public.reviews VALIDATE CONSTRAINT reviews_review_title_len;
  EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'VALIDATE reviews_review_title_len skipped: %', SQLERRM; END;
END $$;

-- ------------------------------------------------------------
-- 3. Sanitization trigger — only real admins (active admin_users
--    row matching the JWT uid) may create published reviews.
--    Everyone else's insert is locked to the pending state and
--    admin-controlled fields (photo, role, ordering) are cleared.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_guest_review_state()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.is_active = TRUE
  ) THEN
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_guest_review_state ON public.reviews;
CREATE TRIGGER enforce_guest_review_state
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_guest_review_state();

-- ------------------------------------------------------------
-- 4. RLS: anonymous visitors may create pending rows ONLY.
--    They still cannot read (existing policy keeps public reads to
--    is_visible = true) and have no UPDATE/DELETE rights (there are
--    no anon policies other than this one), so nobody can approve
--    or modify reviews without an admin session.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Public insert pending reviews" ON public.reviews;

CREATE POLICY "Public insert pending reviews"
  ON public.reviews
  FOR INSERT
  TO anon
  WITH CHECK (
    is_visible = FALSE
    AND is_featured = FALSE
  );

-- ------------------------------------------------------------
-- NOTES
--  * Approval flow stays unchanged: admin toggles is_visible via the
--    existing switch; approved reviews show up on the next page load.
--  * Rejection = delete the pending review from the same admin table.
--  * The stored service-role key is never used by the browser; the
--    public form only talks to PostgREST with the anon key.
--  * Optional hardening (not included by default): once live, could
--    add per-minute throttling using an edge function proxy instead
--    of direct PostgREST inserts, and Supabase's built-in CAPTCHA
--    verification on the anon client.
-- ------------------------------------------------------------
