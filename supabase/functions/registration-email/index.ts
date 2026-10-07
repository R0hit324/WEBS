// ============================================================
// Supabase Edge Function: Registration Email
// ============================================================
// This function sends confirmation emails when a new registration is created
// 
// Trigger: Database webhook on registrations table INSERT
// 
// Architecture:
// Registration Form → Supabase Database (registrations table)
//                                    ↓
//                         Supabase Database Webhook
//                                    ↓
//                         Edge Function (this file)
//                                    ↓
//                         Resend Email Service
//                                    ↓
//                         Academy Email
//
// Deployment:
// supabase functions deploy registration-email --project-ref <your-ref>
//
// Webhook Setup (run in Supabase SQL Editor):
// CREATE OR REPLACE FUNCTION public.notify_registration_email()
// RETURNS TRIGGER AS $$
// BEGIN
//   PERFORM net.http_post(
//     url := 'https://<your-project-ref>.supabase.co/functions/v1/registration-email',
//     headers := jsonb_build_object(
//       'Content-Type', 'application/json',
//       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
//     ),
//     body := to_jsonb(NEW)
//   );
//   RETURN NEW;
// END;
// $$ LANGUAGE plpgsql SECURITY DEFINER;
//
// CREATE TRIGGER registration_email_trigger
// AFTER INSERT ON registrations
// FOR EACH ROW EXECUTE FUNCTION public.notify_registration_email();
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Types
interface RegistrationData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  age?: number;
  city?: string;
  interested_range?: string;
  experience_level?: string;
  message?: string;
  status: string;
  created_at: string;
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Configuration from environment
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const ACADEMY_EMAIL = Deno.env.get('ACADEMY_EMAIL')!;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Send email via Resend API
 */
async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Matsya Shooting Academy <noreply@${Deno.env.get('EMAIL_DOMAIN') || 'matysashootingacademy.com'}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }

    return { success: true };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Generate admin notification email
 */
function generateAdminEmail(registration: RegistrationData): EmailPayload {
  const subject = `New Registration: ${registration.full_name}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #111315; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #111315; color: #F5F3EA; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">New Registration</h1>
      </div>
      <div style="background: #191D1B; color: #F5F3EA; padding: 24px; border-radius: 0 0 8px 8px;">
        <p><strong>Name:</strong> ${registration.full_name}</p>
        <p><strong>Email:</strong> ${registration.email}</p>
        <p><strong>Phone:</strong> ${registration.phone}</p>
        ${registration.age ? `<p><strong>Age:</strong> ${registration.age}</p>` : ''}
        ${registration.city ? `<p><strong>City:</strong> ${registration.city}</p>` : ''}
        ${registration.interested_range ? `<p><strong>Interested Range:</strong> ${registration.interested_range}</p>` : ''}
        ${registration.experience_level ? `<p><strong>Experience:</strong> ${registration.experience_level}</p>` : ''}
        ${registration.message ? `<p><strong>Message:</strong><br>${registration.message}</p>` : ''}
        <hr style="border-color: #2A302D; margin: 16px 0;">
        <p style="font-size: 12px; color: #B8B8AD;">
          Registered at: ${new Date(registration.created_at).toLocaleString()}<br>
          Registration ID: ${registration.id}
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
New Registration

Name: ${registration.full_name}
Email: ${registration.email}
Phone: ${registration.phone}
${registration.age ? `Age: ${registration.age}` : ''}
${registration.city ? `City: ${registration.city}` : ''}
${registration.interested_range ? `Interested Range: ${registration.interested_range}` : ''}
${registration.experience_level ? `Experience: ${registration.experience_level}` : ''}
${registration.message ? `Message: ${registration.message}` : ''}

Registered at: ${new Date(registration.created_at).toLocaleString()}
Registration ID: ${registration.id}
  `;

  return {
    to: ACADEMY_EMAIL,
    subject,
    html,
    text,
  };
}

/**
 * Generate confirmation email for the registrant
 */
function generateConfirmationEmail(registration: RegistrationData): EmailPayload {
  const subject = 'Registration Received - Matsya Shooting Sports Academy';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #111315; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #111315; color: #F5F3EA; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Registration Received</h1>
      </div>
      <div style="background: #191D1B; color: #F5F3EA; padding: 24px; border-radius: 0 0 8px 8px;">
        <p>Dear ${registration.full_name},</p>
        <p>Thank you for your interest in <strong>Matsya Shooting Sports Academy</strong>. We have received your registration and our team will contact you shortly.</p>
        
        <div style="background: #202522; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 12px; color: #10B981;">Your Registration Details</h3>
          <p><strong>Name:</strong> ${registration.full_name}</p>
          <p><strong>Email:</strong> ${registration.email}</p>
          <p><strong>Phone:</strong> ${registration.phone}</p>
          ${registration.interested_range ? `<p><strong>Interested Range:</strong> ${registration.interested_range}</p>` : ''}
          ${registration.experience_level ? `<p><strong>Experience Level:</strong> ${registration.experience_level}</p>` : ''}
        </div>
        
        <p>Our team will reach out to you within 24-48 hours to discuss next steps and answer any questions you may have.</p>
        
        <p>In the meantime, feel free to explore our <a href="${Deno.env.get('VITE_APP_URL') || 'https://matysashootingacademy.com'}/training" style="color: #10B981;">training programs</a> and <a href="${Deno.env.get('VITE_APP_URL') || 'https://matysashootingacademy.com'}/facilities" style="color: #10B981;">facilities</a>.</p>
        
        <hr style="border-color: #2A302D; margin: 24px 0;">
        <p style="font-size: 12px; color: #B8B8AD;">
          Matsya Shooting Sports Academy<br>
          Alwar, Rajasthan, India<br>
          Alwar's first RRA-certified academy
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Registration Received - Matsya Shooting Sports Academy

Dear ${registration.full_name},

Thank you for your interest in Matsya Shooting Sports Academy. We have received your registration and our team will contact you shortly.

Your Registration Details:
- Name: ${registration.full_name}
- Email: ${registration.email}
- Phone: ${registration.phone}
${registration.interested_range ? `- Interested Range: ${registration.interested_range}` : ''}
${registration.experience_level ? `- Experience Level: ${registration.experience_level}` : ''}

Our team will reach out to you within 24-48 hours to discuss next steps.

Matsya Shooting Sports Academy
Alwar, Rajasthan, India
Alwar's first RRA-certified academy
  `;

  return {
    to: registration.email,
    subject,
    html,
    text,
  };
}

/**
 * Main handler
 */
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse registration data
    const registration: RegistrationData = await req.json();

    if (!registration.id || !registration.email || !registration.full_name) {
      return new Response(
        JSON.stringify({ error: 'Invalid registration data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send admin notification
    const adminEmail = generateAdminEmail(registration);
    const adminResult = await sendEmail(adminEmail);
    
    if (!adminResult.success) {
      console.error('Failed to send admin email:', adminResult.error);
    }

    // Send confirmation to registrant
    const confirmationEmail = generateConfirmationEmail(registration);
    const confirmationResult = await sendEmail(confirmationEmail);
    
    if (!confirmationResult.success) {
      console.error('Failed to send confirmation email:', confirmationResult.error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        adminEmailSent: adminResult.success,
        confirmationEmailSent: confirmationResult.success,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});