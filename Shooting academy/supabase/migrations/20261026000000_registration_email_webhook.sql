-- ============================================================
-- Migration: Register DB webhook for registration-email Edge Function
-- ============================================================
-- This migration creates the trigger that fires the registration-email
-- Edge Function AFTER INSERT on the public.registrations table.
--
-- PREREQUISITES (must be done in Supabase Dashboard BEFORE applying):
-- 1. Deploy the registration-email function:
--    supabase functions deploy registration-email --project-ref <ref>
-- 2. Set required secrets in Dashboard → Project Settings → Functions:
--    - RESEND_API_KEY (your Resend API key)
--    - ACADEMY_EMAIL (recipient email, e.g. alwarshooting@gmail.com)
--    - EMAIL_DOMAIN (your verified Resend domain, e.g. matsyashootingacademy.com)
--    - SUPABASE_SERVICE_ROLE_KEY (auto-injected, do not set manually)
--
-- The webhook uses pg_net.http_post which requires the pg_net extension
-- (enabled by default on Supabase). The function URL is constructed from
-- the project ref — replace <YOUR_PROJECT_REF> below with your actual ref.
-- ============================================================

-- Enable pg_net if not already (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- The trigger function — calls the Edge Function with the new row as JSON
--
-- SECURITY (reviewer point 5):
--   * `SET search_path = ''` — blank search_path so callers cannot
--     shadow any symbol by creating same-named objects in a schema
--     they can reach. pg_catalog is still searched implicitly even
--     with an empty path (operators resolve), but every builtin used
--     here is additionally qualified explicitly as belt-and-braces.
--     `net.http_post` is hard-qualified via the extension schema.
--   * Owner: the role that applies this migration (postgres /
--     supabase_admin on Supabase). NEVER re-own it to an API role.
--   * EXECUTE: a RETURNS TRIGGER function cannot be invoked through
--     PostgREST RPC; the PUBLIC EXECUTE default is revoked below so
--     even future wrappers cannot hand this function to the API roles.
--   * Secrets: the service-role key is read from the database setting
--     `app.settings.service_role_key` (set once by the operator via
--     ALTER DATABASE ... SET) and is only placed into the outbound
--     Authorization header. It is never written to any table, log
--     payload or this SQL file.
--   * Edge Function JWT verification: keep the function's verify_jwt
--     enabled (Supabase default). The webhook's
--     `Authorization: Bearer <service_role_key>` passes that check; a
--     disabled verify_jwt would let anyone with the function URL
--     trigger emails.
CREATE OR REPLACE FUNCTION public.notify_registration_email()
RETURNS TRIGGER AS $$
DECLARE
  -- Replace <YOUR_PROJECT_REF> with your actual Supabase project reference
  -- (the <PROJECT_REF> subdomain of the dashboard URL)
  function_url text := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/registration-email';
  service_role_key text := pg_catalog.current_setting('app.settings.service_role_key', true);
  resp jsonb;
BEGIN
  -- Guard: if the service role key setting is missing, log and skip
  IF service_role_key IS NULL OR service_role_key = '' THEN
    RAISE WARNING 'registration-email webhook: app.settings.service_role_key not set; skipping';
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := function_url,
    headers := pg_catalog.jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := pg_catalog.to_jsonb(NEW),
    timeout_milliseconds := 5000
  ) INTO resp;

  -- Log non-2xx responses for debugging (visible in Supabase Logs)
  IF resp IS NOT NULL AND (resp->>'statusCode') IS NOT NULL AND (resp->>'statusCode')::int >= 300 THEN
    RAISE WARNING 'registration-email webhook returned %: %', resp->>'statusCode', resp->>'body';
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block the registration INSERT because of email failure
  RAISE WARNING 'registration-email webhook error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';

-- EXECUTE hygiene (contrast with the role helpers, which KEEP explicit
-- anon/authenticated grants because RLS policy expressions must call
-- them): this function is only ever fired by the trigger machinery,
-- which performs no EXECUTE privilege check — revoking the default
-- PUBLIC grant changes nothing for the trigger and closes the RPC
-- avenue outright.
REVOKE ALL ON FUNCTION public.notify_registration_email()
  FROM PUBLIC, anon, authenticated;

-- Attach the trigger (idempotent: drops existing first)
DROP TRIGGER IF EXISTS registration_email_trigger ON public.registrations;
CREATE TRIGGER registration_email_trigger
AFTER INSERT ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.notify_registration_email();

-- ============================================================
-- Post-apply checklist (run in Supabase SQL Editor):
-- 1. UPDATE the function_url in notify_registration_email() with your
--    actual project ref, then re-run the CREATE OR REPLACE FUNCTION block.
-- 2. Verify the trigger exists:
--    SELECT * FROM information_schema.triggers WHERE trigger_name = 'registration_email_trigger';
-- 3. Test by inserting a row into registrations and check Edge Function logs.
-- ============================================================