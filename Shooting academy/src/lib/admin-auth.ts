import { getSupabaseConfig, TABLES } from './supabase';

export interface AdminSession {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
      role?: string;
    };
  };
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export type AdminRole = 'admin' | 'editor' | 'viewer';

export type AdminRoleCheck =
  | { status: 'allowed'; role: AdminRole }
  | { status: 'denied' }        // no session, no admin_users row, or inactive row
  | { status: 'unavailable' };  // role check could not be performed (network/DB error)

// In-memory role for the admin UI session. Set by the route guard after a
// successful role check; consumed by admin-api/base modules to hide/disable
// write controls for read-only roles. Frontend gating is UX only — Supabase
// RLS (can_admin_write()) is the actual enforcement layer.
let rememberedAdminRole: AdminRole | null | undefined = undefined;

export function rememberAdminRole(role: AdminRole | null): void {
  rememberedAdminRole = role;
}

export function getRememberedAdminRole(): AdminRole | null | undefined {
  return rememberedAdminRole;
}

const ADMIN_SESSION_KEY = 'matsya_admin_session';

export async function adminLogin(email: string, password: string): Promise<AdminSession> {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    throw new Error('Supabase not configured');
  }

  const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': config.anonKey,
      'Authorization': `Bearer ${config.anonKey}`,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.msg || data.error_description || 'Login failed');
  }

  const session: AdminSession = {
    user: data.user,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
  };

  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function adminLogout(): Promise<void> {
  const session = getAdminSession();
  if (session) {
    const config = getSupabaseConfig();
    if (config.url && config.anonKey) {
      await fetch(`${config.url}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.anonKey,
          'Authorization': `Bearer ${session.access_token}`,
        },
      }).catch(() => {});
    }
  }
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const stored = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!stored) return null;

    const session: AdminSession = JSON.parse(stored);

    // Reject tampered / malformed entries instead of sending
    // `Bearer undefined`-style headers downstream.
    const valid =
      session &&
      typeof session.user === 'object' &&
      session.user !== null &&
      typeof session.user.id === 'string' &&
      session.user.id.length > 0 &&
      typeof session.access_token === 'string' &&
      session.access_token.length > 0 &&
      typeof session.refresh_token === 'string' &&
      typeof session.expires_at === 'number' &&
      Number.isFinite(session.expires_at);

    if (!valid) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }

    if (Date.now() > session.expires_at - 60000) {
      return await refreshAdminSession(session);
    }

    return session;
  } catch {
    return null;
  }
}

async function refreshAdminSession(session: AdminSession): Promise<AdminSession | null> {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return null;

  try {
    const response = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`,
      },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });

    if (!response.ok) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }

    const data = await response.json();
    const newSession: AdminSession = {
      user: data.user,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000),
    };

    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(newSession));
    return newSession;
  } catch {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession();
  return session !== null;
}

export async function requireAdminAuth(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function getAdminAuthHeaders(): Promise<{ Authorization: string; apikey: string } | null> {
  const session = await getAdminSession();
  if (!session) return null;

  const config = getSupabaseConfig();
  return {
    Authorization: `Bearer ${session.access_token}`,
    apikey: config.anonKey,
  };
}

export async function fetchAdminUser(): Promise<AdminSession['user'] | null> {
  const session = await getAdminSession();
  if (!session) return null;

  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return null;

  try {
    const response = await fetch(`${config.url}/auth/v1/user`, {
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function checkAdminRole(): Promise<boolean> {
  const check = await getAdminRole();
  return check.status === 'allowed' && (check.role === 'admin' || check.role === 'editor');
}

/**
 * Decides whether the current session may enter an admin route and with
 * which role:
 *  - 'allowed'    → active admin_users row with a known role (admin/editor/viewer)
 *  - 'denied'     → no session, no admin_users row for this uid, or is_active = false
 *  - 'unavailable'→ transient failure (network / 5xx / unexpected payload).
 *                   Callers should fail CLOSED for navigation (deny entry and
 *                   let the user retry from the login screen) but keep RLS as
 *                   the real guarantee — never trust this UI decision for data
 *                   access.
 */
export async function getAdminRole(): Promise<AdminRoleCheck> {
  const session = await getAdminSession();
  if (!session) return { status: 'denied' };

  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return { status: 'unavailable' };

  try {
    const response = await fetch(`${config.url}/rest/v1/${TABLES.ADMIN_USERS}?id=eq.${encodeURIComponent(session.user.id)}&select=role,is_active`, {
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) return { status: 'unavailable' };

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return { status: 'denied' };

    const row = data[0];
    if (row.is_active !== true) return { status: 'denied' };
    if (!['admin', 'editor', 'viewer'].includes(row.role)) return { status: 'denied' };

    return { status: 'allowed', role: row.role as AdminRole };
  } catch {
    return { status: 'unavailable' };
  }
}
