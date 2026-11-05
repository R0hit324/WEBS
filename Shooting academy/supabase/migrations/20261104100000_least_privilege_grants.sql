-- ============================================================
-- 2026-11-04 — Security hardening pass: least-privilege grants
-- (table-level AND column-level) for the five audited tables
--
-- LIVE STATE CONFIRMED BY READ-ONLY AUDIT (2026-11-04):
--   * anon AND authenticated both hold ALL EIGHT table privileges
--     (SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES,
--     TRIGGER, MAINTAIN) on admin_users, registrations,
--     pay_play_bookings, pay_play_options and reviews.
--   * Both roles ALSO hold column-level INSERT/SELECT/UPDATE/
--     REFERENCES on (effectively) every column of those tables.
--
-- WHY TABLE-LEVEL REVOKES ALONE ARE NOT ENOUGH:
--   In PostgreSQL, table ACLs and per-column ACLs are separate
--   grant sets. `REVOKE ALL ON table FROM role` removes only the
--   table-level entry; column-level grants SURVIVE it and keep
--   authorizing the corresponding operations on those columns.
--   (This is exactly the gap that the never-applied migration 12
--   was meant to close.) This migration therefore revokes BOTH
--   layers, column by column, before re-granting the minimum.
--
-- PRIVILEGES REMOVED (both roles, all five tables):
--   TRUNCATE, REFERENCES, TRIGGER, MAINTAIN, DELETE (from anon),
--   UPDATE (from anon), plus every column-level grant — replaced
--   by the explicit re-grants below.
--
-- PRIVILEGES RETAINED / RE-GRANTED (verified against the actual
-- frontend and admin payloads):
--   anon:
--     registrations      INSERT on the 8 guest form columns
--                        (RegistrationPage.js sends Prefer:
--                        return=minimal → no SELECT needed)
--     pay_play_bookings  INSERT on the 9 guest form columns ONLY.
--                        The form was switched to "Prefer:
--                        return=minimal" in this pass (its response
--                        body was never read), so anon holds NO
--                        SELECT on bookings — a guest can never read
--                        back any booking row, theirs or anyone's.
--     reviews            INSERT on the 6 guest-submittable columns
--                        (author_name, rating, review_title,
--                        review_text, is_visible, is_featured).
--                        ReviewForm.js sends is_visible=false and
--                        is_featured=false explicitly; PostgREST
--                        rejects any payload containing a column the
--                        role cannot insert (PGRST204), so both must
--                        be granted. This adds NO privilege: the
--                        guest trigger forces both to FALSE for
--                        non-admins and both INSERT policies' WITH
--                        CHECK requires FALSE anyway.
--                        (ReviewForm.js uses supabase-js .insert()
--                        → return=minimal), plus table SELECT for
--                        the public review wall (select=*; RLS
--                        "Public read reviews" limits rows to
--                        is_visible = true).
--     pay_play_options   table SELECT for the public listing and
--                        detail pages (select=*; RLS limits rows to
--                        is_visible = true). Prices are public
--                        content by design.
--     admin_users        NOTHING.
--   authenticated:
--     registrations, pay_play_bookings, pay_play_options, reviews:
--                        SELECT, INSERT, UPDATE, DELETE (table
--                        level). The admin dashboard runs as the
--                        logged-in user's role (no service_role key
--                        anywhere in src/), so these privileges plus
--                        the admin RLS policies are the working
--                        path. RLS — not grants — decides who gets
--                        rows: only active admins pass the admin
--                        policies.
--     admin_users        SELECT only (own row, via the
--                        "Admin select own account" policy created
--                        by 20261104000000). No INSERT/UPDATE/
--                        DELETE — role and is_active changes happen
--                        in the Supabase dashboard only.
--   service_role / postgres: UNTOUCHED (direct grants, not via
--     PUBLIC; the revokes below do not affect them).
--
-- Sequences: all five tables use UUID primary keys
-- (uuid_generate_v4()), so no sequence USAGE grants are involved.
--
-- Other public content tables (coaches, gallery_images, ...) are
-- deliberately NOT touched: their anon SELECT grants back the
-- public website.
--
-- RUN AFTER 20261104000000_guest_state_triggers_and_policies.sql.
-- Idempotent: revokes and grants are naturally repeatable.
--
-- Transaction safety: the Supabase SQL Editor and `supabase db push`
-- each run this file inside a SINGLE transaction — a failure (e.g.
-- the fail-closed column gate) rolls the whole file back, so grants
-- can never end up half-applied.
--
-- Review status: reviewed SQL only — NOT executed against any
-- live database (local-only audit policy).
-- ============================================================

-- ------------------------------------------------------------
-- 0. Fail-closed gate: the canonical guest columns must exist
--    (created by 20261104000000). Aborting here is safe — grants
--    are the LAST step of the hardening path.
-- ------------------------------------------------------------
DO $$
DECLARE
  v_missing text;
BEGIN
  SELECT string_agg(c, ', ') INTO v_missing
  FROM (
    SELECT 'registrations.experience' AS c
    WHERE NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'experience'
    )
    UNION ALL
    SELECT 'pay_play_bookings.' || col
    FROM unnest(ARRAY['city', 'experience_level', 'preferred_date', 'preferred_time', 'message']) AS col
    WHERE NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'pay_play_bookings' AND column_name = col
    )
  ) AS missing_cols(c);

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'Missing canonical column(s): % — apply 20261104000000_guest_state_triggers_and_policies.sql first', v_missing;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 1. Wipe table-level AND column-level privileges, then re-grant
--    the minimum. One block per table.
-- ------------------------------------------------------------

-- ============================================================
-- 1a. registrations
-- ============================================================
REVOKE ALL ON public.registrations FROM anon, authenticated, PUBLIC;

DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'registrations'
  LOOP
    EXECUTE format(
      'REVOKE ALL (%I) ON public.registrations FROM anon, authenticated, PUBLIC',
      c.column_name
    );
  END LOOP;
END $$;

GRANT INSERT (full_name, age, phone, email, city, interested_range, experience, message)
  ON public.registrations TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO authenticated;

-- ============================================================
-- 1b. pay_play_bookings
-- ============================================================
REVOKE ALL ON public.pay_play_bookings FROM anon, authenticated, PUBLIC;

DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pay_play_bookings'
  LOOP
    EXECUTE format(
      'REVOKE ALL (%I) ON public.pay_play_bookings FROM anon, authenticated, PUBLIC',
      c.column_name
    );
  END LOOP;
END $$;

GRANT INSERT (full_name, phone, email, city, experience_level, session_id,
              preferred_date, preferred_time, message)
  ON public.pay_play_bookings TO anon;

-- NO anon SELECT on pay_play_bookings, by design. The booking form
-- previously sent "Prefer: return=representation" (which would have
-- required a SELECT grant for RETURNING) but never read the response
-- body — it only checks response.ok. The frontend was changed to
-- "Prefer: return=minimal" in the same pass, so no SELECT privilege
-- is needed and no booking row can ever be returned to a guest.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pay_play_bookings TO authenticated;

-- ============================================================
-- 1c. reviews
-- ============================================================
REVOKE ALL ON public.reviews FROM anon, authenticated, PUBLIC;

DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reviews'
  LOOP
    EXECUTE format(
      'REVOKE ALL (%I) ON public.reviews FROM anon, authenticated, PUBLIC',
      c.column_name
    );
  END LOOP;
END $$;

-- is_visible/is_featured ARE granted (both FALSE-only in practice):
-- ReviewForm.js always sends them, and PostgREST rejects payloads
-- containing columns outside the role's INSERT grant (PGRST204).
-- The trigger forces both to FALSE for non-admins and the WITH CHECK
-- requires FALSE — a guest cannot publish through either path.
GRANT INSERT (author_name, rating, review_title, review_text, is_visible, is_featured)
  ON public.reviews TO anon;

-- Public review wall reads with select=* (Reviews.js / ReviewsPage.js);
-- RLS "Public read reviews" limits rows to is_visible = true.
GRANT SELECT ON public.reviews TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;

-- ============================================================
-- 1d. pay_play_options
-- ============================================================
REVOKE ALL ON public.pay_play_options FROM anon, authenticated, PUBLIC;

DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'pay_play_options'
  LOOP
    EXECUTE format(
      'REVOKE ALL (%I) ON public.pay_play_options FROM anon, authenticated, PUBLIC',
      c.column_name
    );
  END LOOP;
END $$;

-- Public listing + session detail pages read with select=*;
-- RLS "Public read pay play options" limits rows to
-- is_visible = true. Prices/availability are public content.
GRANT SELECT ON public.pay_play_options TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pay_play_options TO authenticated;

-- ============================================================
-- 1e. admin_users
-- ============================================================
REVOKE ALL ON public.admin_users FROM anon, authenticated, PUBLIC;

DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'admin_users'
  LOOP
    EXECUTE format(
      'REVOKE ALL (%I) ON public.admin_users FROM anon, authenticated, PUBLIC',
      c.column_name
    );
  END LOOP;
END $$;

-- Own-row read for the login/verification flow; the
-- "Admin select own account" policy (20261104000000) limits the
-- rows to id = auth.uid() AND is_active. No write path at all.
GRANT SELECT ON public.admin_users TO authenticated;

-- ------------------------------------------------------------
-- POST-APPLY VERIFICATION (see Temp/security-verification.sql, G7):
--   * No TRUNCATE / MAINTAIN / REFERENCES / TRIGGER / DELETE /
--     UPDATE for anon on any of the five tables.
--   * No column-level grants remain for anon beyond the explicit
--     lists above (information_schema.column_privileges).
--   * NO anon SELECT on pay_play_bookings at all (the form sends
--     return=minimal; guests can never read booking rows).
--   * authenticated has no INSERT/UPDATE/DELETE on admin_users.
--   * service_role privileges unchanged.
-- ============================================================
