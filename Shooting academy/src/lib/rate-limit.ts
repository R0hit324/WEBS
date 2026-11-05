// Client-side rate limiting utility
//
// Provides simple, per-origin rate limiting for form submissions and
// auth-sensitive actions. Uses sessionStorage (survives page navigation
// but clears on tab close) with a fallback to in-memory Map for
// same-page interactions.
//
// This is a **first line of defense** — it improves UX by preventing
// accidental double-submits and naive abuse. The real enforcement
// lives at the Edge Function / Supabase / WAF layer.

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
}

/**
 * In-memory store (per page load). Used as fallback when
 * sessionStorage is unavailable (e.g., private browsing, Safari).
 */
const memoryStore = new Map<string, RateLimitRecord>();

/**
 * Get the appropriate store for the current environment.
 */
function getStore(): Map<string, RateLimitRecord> {
  try {
    // Test if sessionStorage is actually writable
    const testKey = '__ratelimit_test__';
    sessionStorage.setItem(testKey, '1');
    sessionStorage.removeItem(testKey);
    // Use a namespaced prefix in sessionStorage
    return {
      get(key: string) {
        const raw = sessionStorage.getItem(`ratelimit:${key}`);
        return raw ? JSON.parse(raw) : undefined;
      },
      set(key: string, value: RateLimitRecord) {
        sessionStorage.setItem(`ratelimit:${key}`, JSON.stringify(value));
      },
      delete(key: string) {
        sessionStorage.removeItem(`ratelimit:${key}`);
      },
      has(key: string) {
        return sessionStorage.getItem(`ratelimit:${key}`) !== null;
      },
    } as Map<string, RateLimitRecord>;
  } catch {
    return memoryStore;
  }
}

const store = getStore();

/**
 * Prune expired entries from the store.
 */
function pruneExpired(): void {
  const now = Date.now();
  // Use forEach for Map-like objects that may not implement Symbol.iterator
  if (typeof store.forEach === 'function') {
    store.forEach((record, key) => {
      if (record.resetAt <= now) store.delete(key);
    });
  } else {
    // Fallback for plain objects (shouldn't happen with our stores)
    for (const key in store) {
      if (Object.prototype.hasOwnProperty.call(store, key)) {
        const record = store[key];
        if (record && record.resetAt <= now) store.delete(key);
      }
    }
  }
}

/**
 * Generate a stable identifier for the current client.
 * Uses a combination of sessionStorage-persisted random ID + IP hint
 * from a header if available (Edge Functions can see x-forwarded-for).
 */
let clientId: string | null = null;

function getClientId(): string {
  if (clientId) return clientId;

  try {
    let id = sessionStorage.getItem('ratelimit:client_id');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('ratelimit:client_id', id);
    }
    clientId = id;
  } catch {
    clientId = `mem_${crypto.randomUUID()}`;
  }
  return clientId;
}

/**
 * Check and consume a rate limit slot.
 *
 * @param action - Logical action name (e.g., 'registration', 'booking', 'contact', 'admin-login')
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns RateLimitResult with allowed/remaining/retry info
 */
export function checkRateLimit(
  action: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  pruneExpired();

  const key = `${action}:${getClientId()}`;
  const now = Date.now();

  const record = store.get(key);

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
      retryAfterMs: 0,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
      retryAfterMs: record.resetAt - now,
    };
  }

  record.count++;
  store.set(key, record);
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
    retryAfterMs: 0,
  };
}

/**
 * Reset a specific action's rate limit (e.g., on successful login).
 */
export function resetRateLimit(action: string): void {
  const key = `${action}:${getClientId()}`;
  store.delete(key);
}

/**
 * Get remaining requests without consuming a slot (for UI hints).
 */
export function getRemainingRequests(action: string, maxRequests: number, windowMs: number): number {
  pruneExpired();
  const key = `${action}:${getClientId()}`;
  const record = store.get(key);
  const now = Date.now();

  if (!record || now > record.resetAt) return maxRequests;
  return Math.max(0, maxRequests - record.count);
}

/**
 * Format retry-after time for user-facing messages.
 */
export function formatRetryAfter(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

/**
 * Predefined rate limit configs for the application's public endpoints.
 * Adjust these based on observed traffic and abuse patterns.
 */
export const RATE_LIMIT_CONFIGS = {
  /** Public registration form — generous but bounded */
  registration: { maxRequests: 5, windowMs: 60_000 }, // 5/min
  /** Pay & Play booking form — similar to registration */
  booking: { maxRequests: 5, windowMs: 60_000 }, // 5/min
  /** Contact form — matches Edge Function limit (3/min server, 5/min client for UX headroom) */
  contact: { maxRequests: 5, windowMs: 60_000 }, // 5/min
  /** Admin login — strict to prevent credential stuffing */
  adminLogin: { maxRequests: 5, windowMs: 15 * 60_000 }, // 5 per 15 min
  /** Admin session check (getAdminRole) — generous for UI polling */
  adminRoleCheck: { maxRequests: 30, windowMs: 60_000 }, // 30/min
} as const;

export type RateLimitAction = keyof typeof RATE_LIMIT_CONFIGS;

/**
 * Convenience wrapper using predefined configs.
 */
export function checkRateLimitAction(action: RateLimitAction): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[action];
  return checkRateLimit(action, config.maxRequests, config.windowMs);
}

/**
 * Reset rate limit for an action (e.g., after successful auth).
 */
export function resetRateLimitAction(action: RateLimitAction): void {
  resetRateLimit(action);
}