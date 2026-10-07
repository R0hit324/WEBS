// ============================================================
// Supabase Edge Function: Contact Form Email
// ============================================================
// Sends notification when contact form is submitted
//
// Trigger: Called directly from frontend or via database webhook
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface ContactData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const ACADEMY_EMAIL = Deno.env.get('ACADEMY_EMAIL')!;

async function sendEmail(payload: { to: string; subject: string; html: string; text: string }) {
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
    throw new Error(`Resend error: ${error.message}`);
  }

  return response.json();
}

function generateEmail(data: ContactData) {
  const subject = `Contact Form: ${data.subject || 'General Inquiry'}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #111315; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #111315; color: #F5F3EA; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Contact Form Submission</h1>
      </div>
      <div style="background: #191D1B; color: #F5F3EA; padding: 24px; border-radius: 0 0 8px 8px;">
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #202522; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${data.message}</div>
      </div>
    </body>
    </html>
  `;

  const text = `
Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Subject: ${data.subject}

Message:
${data.message}
  `;

  return { to: ACADEMY_EMAIL, subject, html, text };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data: ContactData = await req.json();
    const email = generateEmail(data);
    await sendEmail(email);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Contact email error:', err);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});