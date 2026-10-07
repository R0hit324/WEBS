# Supabase Configuration for Matsya Shooting Sports Academy

## Project Setup

1. Create a new Supabase project at https://supabase.com
2. Copy the project URL and anon key to your environment variables
3. Run the migration SQL in the Supabase SQL Editor
4. Create storage buckets in Supabase Dashboard
4. Configure email templates in Resend
5. Deploy edge functions

## Required Environment Variables

### Frontend (Vite)
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=https://your-domain.com
```

### Backend (Edge Functions)
```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your-resend-key
ACADEMY_EMAIL=info@yourdomain.com
EMAIL_DOMAIN=yourdomain.com
```

## Database Migration

Run `supabase/migrations/20251007000000_initial_schema.sql` in the Supabase SQL Editor.

## Storage Buckets

Create these buckets in Supabase Dashboard > Storage:

| Bucket Name | Public | Purpose |
|-------------|--------|---------|
| gallery | Yes | Gallery images |
| coaches | Yes | Coach photos |
| achievements | Yes | Achievement photos |
| facilities | Yes | Facility images |
| academy | Yes | Academy logo, hero images |
| uploads | No | Temporary form uploads |

### Storage Policies

For each public bucket, add these policies:

**Public Read:**
```sql
CREATE POLICY "Public read" ON storage.objects
FOR SELECT USING (bucket_id = 'gallery');
```

**Admin Write:**
```sql
CREATE POLICY "Admin write" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'gallery' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.is_active = true
  )
);
```

## Edge Functions Deployment

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy registration-email
supabase functions deploy contact-email
```

## Database Webhooks

After deploying edge functions, set up database webhooks in Supabase Dashboard > Database > Webhooks:

1. **Registration Email Webhook:**
   - Table: `registrations`
   - Events: `INSERT`
   - URL: `https://your-project-ref.supabase.co/functions/v1/registration-email`
   - Headers: `Authorization: Bearer <service-role-key>`

2. **Contact Email Webhook:**
   - Table: `contact_submissions` (if created)
   - Events: `INSERT`
   - URL: `https://your-project-ref.supabase.co/functions/v1/contact-email`
   - Headers: `Authorization: Bearer <service-role-key>`

## Resend Email Setup

1. Create account at https://resend.com
2. Add and verify your domain
3. Create API key
4. Update environment variables

## Admin User Setup

After creating the database, insert an admin user:

```sql
INSERT INTO admin_users (email, full_name, role)
VALUES ('admin@yourdomain.com', 'Admin Name', 'admin');
```

Then use Supabase Auth to create the actual auth user with the same email.

## Local Development

```bash
# Start Supabase locally
supabase start

# This provides:
# - Local PostgreSQL on port 54322
# - Local Supabase Studio on port 54323
# - Local Edge Functions on port 54321

# Run migrations locally
supabase db reset

# Deploy functions locally
supabase functions serve
```

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Public read policies only for visible content
- [ ] Admin policies restrict write access to authenticated admins
- [ ] Registrations table: public insert only, no public read
- [ ] Service role key never exposed to frontend
- [ ] Environment variables not committed to git
- [ ] CORS configured for your domain only
- [ ] Rate limiting on edge functions
- [ ] Input validation on all forms