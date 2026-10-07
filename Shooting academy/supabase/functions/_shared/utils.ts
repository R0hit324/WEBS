// ============================================================
// Shared Utilities for Supabase Edge Functions
// ============================================================

/**
 * Create standardized error response
 */
export function errorResponse(message: string, status = 500, details?: Record<string, unknown>) {
  return new Response(
    JSON.stringify({ error: message, ...(details && { details }) }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

/**
 * Create standardized success response
 */
export function successResponse<T>(data: T, status = 200) {
  return new Response(
    JSON.stringify({ success: true, data }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

/**
 * Verify authorization header
 */
export function verifyAuth(req: Request, expectedKey?: string): boolean {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.slice(7);
  
  // If expected key is provided, verify it matches
  if (expectedKey) {
    return token === expectedKey;
  }

  // Otherwise just check if token exists (Supabase JWT validation would go here)
  return token.length > 0;
}

/**
 * Parse and validate JSON body
 */
export async function parseJsonBody<T>(req: Request): Promise<T> {
  try {
    return await req.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
}

/**
 * CORS headers for all edge functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Handle CORS preflight
 */
export function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

/**
 * Get environment variable with validation
 */
export function getEnv(key: string, required = true): string {
  const value = Deno.env.get(key);
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

/**
 * Create Supabase client for edge functions
 */
export function createSupabaseClient() {
  const url = getEnv('SUPABASE_URL');
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  
  // Dynamic import for Deno
  // import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
  // return createClient(url, key);
  
  return { url, key };
}

/**
 * Rate limiting helper (simple in-memory)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
}