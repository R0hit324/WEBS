// ============================================================
// Supabase Edge Function: Contact Form Email
// ============================================================
// Sends notification when contact form is submitted.
// Uses Resend for delivery. All credentials live in Supabase
// secrets (RESEND_API_KEY, ACADEMY_EMAIL, EMAIL_DOMAIN optional).
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createLogger, logEmailSend, logHttpRequest, logHttpResponse } from '../_shared/logging.ts';

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

const LIMITS = {
  name: { min: 2, max: 80 },
  email: { min: 5, max: 120 },
  phone: { max: 20 },
  subject: { min: 1, max: 60 },
  message: { min: 10, max: 4000 },
};

// Simple in-memory rate limiting (per warm instance).
interface WindowRecord { count?: number; resetAt: number; }
const rateLimitMap = new Map<string, WindowRecord>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60_000;

// Duplicate protection: identical payloads within the window are not
// re-sent. The first send is treated as delivered.
const sentHashes = new Map<string, WindowRecord>();
const DUPLICATE_WINDOW_MS = 5 * 60_000;

function hashPayload(data: ContactData): string {
  const raw = [data.name, data.email, data.phone, data.subject, data.message].join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) | 0;
  }
  return String(hash >>> 0);
}

function pruneExpired(map: Map<string, WindowRecord>) {
  const now = Date.now();
  for (const [key, value] of map) {
    if (now > value.resetAt) map.delete(key);
  }
}

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function sanitizeMessage(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Logger for this function
const log = createLogger('contact-email');

function clientKey(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

async function sendEmail(payload: { to: string; subject: string; html: string; text: string; replyTo: string }): Promise<void> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) throw new Error('NOT_CONFIGURED');

  const fromDomain = Deno.env.get('EMAIL_DOMAIN') || 'matsyashootingacademy.com';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Matsya Shooting Academy <noreply@${fromDomain}>`,
      to: payload.to,
      reply_to: payload.replyTo,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!response.ok) {
    // Log the provider's diagnostic response server-side only (the body
    // contains Resend's validation/auth error message, never our key,
    // which travels solely in the Authorization header).
    const providerError = await response.text().catch(() => '');
    log.error('Email provider rejected send', {
      status: response.status,
      error: providerError ? providerError.slice(0, 800) : '<no response body>',
    });
    // Provider problem (dispatch issue). Do not surface internals to client.
    throw new Error('PROVIDER_ERROR');
  }
}

function generateEmail(data: { name: string; email: string; phone: string; subject: string; message: string }) {
  const subject = `Contact Form: ${data.subject}`;

  const rows: Array<[string, string]> = [
    ['Name', escapeHtml(data.name)],
    ['Email', escapeHtml(data.email)],
    ['Phone', data.phone ? escapeHtml(data.phone) : '—'],
    ['Subject', escapeHtml(data.subject)],
  ];

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #111315; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #111315; color: #F5F3EA; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Contact Form Submission</h1>
      </div>
      <div style="background: #191D1B; color: #F5F3EA; padding: 24px; border-radius: 0 0 8px 8px;">
        ${rows.map(([label, value]) => `<p><strong>${label}:</strong> ${value}</p>`).join('\n        ')}
        <p><strong>Message:</strong></p>
        <div style="background: #202522; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
      </div>
    </body>
    </html>
  `;

  const text = `
Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || '—'}
Subject: ${data.subject}

Message:
${data.message}
  `;

  return { subject, html, text };
}

serve(async (req) => {
  logHttpRequest(log, req);

  if (req.method === 'OPTIONS') {
    logHttpResponse(log, 200);
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    log.warn('Method not allowed', { method: req.method });
    logHttpResponse(log, 405);
    return json(405, { error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      log.warn('Unauthorized: missing or invalid Authorization header');
      logHttpResponse(log, 401);
      return json(401, { error: 'Unauthorized' });
    }

    // Only requests carrying the project's publishable key are accepted.
    // Previously any bearer token passed, allowing unauthenticated callers
    // to consume our Resend quota.
    const bearer = authHeader.slice('Bearer '.length).trim();
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!anonKey || bearer !== anonKey) {
      log.warn('Unauthorized: invalid anon key');
      logHttpResponse(log, 401);
      return json(401, { error: 'Unauthorized' });
    }

    // Abuse protection: per-IP rate limit
    pruneExpired(rateLimitMap);
    const key = clientKey(req);
    const now = Date.now();
    const record = rateLimitMap.get(key);
    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    } else if ((record.count ?? 0) >= RATE_LIMIT_MAX) {
      log.warn('Rate limit exceeded', { key });
      logHttpResponse(log, 429);
      return json(429, { error: 'Too many requests. Please wait a minute and try again.' });
    } else {
      record.count = (record.count ?? 0) + 1;
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      log.warn('Invalid JSON body');
      logHttpResponse(log, 400);
      return json(400, { error: 'Invalid request.' });
    }

    // Validate and sanitize
    const data: ContactData = {
      name: sanitizeText(body.name, LIMITS.name.max),
      email: sanitizeText(body.email, LIMITS.email.max).toLowerCase(),
      phone: sanitizeText(body.phone ?? '', LIMITS.phone.max),
      subject: sanitizeText(body.subject, LIMITS.subject.max),
      message: sanitizeMessage(body.message, LIMITS.message.max),
    };

    const missing: string[] = [];
    if (data.name.length < LIMITS.name.min) missing.push('name');
    if (!isValidEmail(data.email)) missing.push('email');
    if (data.subject.length < LIMITS.subject.min) missing.push('subject');
    if (data.message.length < LIMITS.message.min) missing.push('message');
    if (missing.length > 0) {
      log.warn('Validation failed', { missing });
      logHttpResponse(log, 400);
      return json(400, { error: `Please provide a valid ${missing.join(', ')}.` });
    }

    if (data.phone && !/^[+]?[0-9 ()-]{7,20}$/.test(data.phone)) {
      log.warn('Invalid phone number');
      logHttpResponse(log, 400);
      return json(400, { error: 'Please provide a valid phone number.' });
    }

    const ACADEMY_EMAIL = Deno.env.get('ACADEMY_EMAIL');
    if (!ACADEMY_EMAIL) {
      log.error('Misconfigured: missing ACADEMY_EMAIL');
      throw new Error('NOT_CONFIGURED');
    }

    // Duplicate protection: identical payload within the window is
    // treated as already delivered.
    pruneExpired(sentHashes);
    const payloadHash = hashPayload(data);
    const dupRecord = sentHashes.get(payloadHash);
    if (dupRecord) {
      log.info('Duplicate submission detected', { key });
      logHttpResponse(log, 200, { duplicate: true });
      return json(200, { success: true, duplicate: true });
    }

    const email = generateEmail(data);
    await sendEmail({
      to: ACADEMY_EMAIL,
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: data.email,
    });

    const toDomain = ACADEMY_EMAIL.split('@')[1] || 'unknown';
    logEmailSend(log, 'contact', toDomain, true);

    sentHashes.set(payloadHash, { resetAt: now + DUPLICATE_WINDOW_MS });

    logHttpResponse(log, 200);
    return json(200, { success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_CONFIGURED') {
      log.error('Contact email misconfigured: missing RESEND_API_KEY or ACADEMY_EMAIL');
    } else {
      log.error('Contact email send failed', err);
    }
    logHttpResponse(log, 500);
    return json(500, { error: 'Message service is temporarily unavailable. Please try again later or contact us directly at alwarshooting@gmail.com.' });
  }
});
