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
  const session = getAdminSession();
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
  const session = getAdminSession();
  if (!session) return false;

  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return false;

  try {
    const response = await fetch(`${config.url}/rest/v1/${TABLES.ADMIN_USERS}?id=eq.${session.user.id}&select=role,is_active`, {
      headers: {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) return false;
    const data = await response.json();
    return data.length > 0 && data[0].is_active === true && ['admin', 'editor'].includes(data[0].role);
  } catch {
    return false;
  }
}