import { getSupabaseConfig, TABLES, getAdminAuthHeaders } from '@/lib/supabase';

export interface AdminListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, string>;
}

export interface AdminListResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export async function adminFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAdminAuthHeaders();
  if (!headers) throw new Error('Not authenticated');

  const config = getSupabaseConfig();
  if (!config.url) throw new Error('Supabase not configured');

  const response = await fetch(`${config.url}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let error: AdminApiError = { code: response.status.toString(), message: errorText };
    try {
      error = JSON.parse(errorText);
    } catch {}
    throw new Error(error.message || errorText);
  }

  if (response.status === 204) return null as T;
  return response.json();
}

export async function adminList<T>(table: string, params: AdminListParams = {}): Promise<AdminListResponse<T>> {
  const headers = await getAdminAuthHeaders();
  if (!headers) throw new Error('Not authenticated');

  const config = getSupabaseConfig();
  if (!config.url) throw new Error('Supabase not configured');

  const {
    page = 1,
    pageSize = 20,
    search = '',
    sortBy = 'display_order',
    sortOrder = 'asc',
    filters = {},
  } = params;

  const queryParams = new URLSearchParams();
  queryParams.set('limit', pageSize.toString());
  queryParams.set('offset', ((page - 1) * pageSize).toString());
  queryParams.set('order', `${sortBy}.${sortOrder}`);

  if (search) {
    queryParams.set('or', `(name.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%,title.ilike.%${search}%,athlete_name.ilike.%${search}%,quote_text.ilike.%${search}%,setting_key.ilike.%${search}%,section_key.ilike.%${search}%)`);
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== undefined) {
      queryParams.set(key, `eq.${value}`);
    }
  });

  const countResponse = await fetch(`${config.url}/rest/v1/${table}?${queryParams.toString()}&limit=1`, {
    headers: { ...headers, Prefer: 'count=exact' },
  });

  const totalCount = parseInt(countResponse.headers.get('content-range')?.split('/')[1] || '0', 10);

  const response = await fetch(`${config.url}/rest/v1/${table}?${queryParams.toString()}`, { headers });
  const data = await response.json();

  return {
    data,
    count: totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export async function adminGet<T>(table: string, id: string): Promise<T | null> {
  const headers = await getAdminAuthHeaders();
  if (!headers) throw new Error('Not authenticated');

  const config = getSupabaseConfig();
  if (!config.url) throw new Error('Supabase not configured');

  const response = await fetch(`${config.url}/rest/v1/${table}?id=eq.${id}`, { headers });
  const data = await response.json();
  return data[0] || null;
}

export async function adminCreate<T>(table: string, data: Partial<T>): Promise<T> {
  const headers = await getAdminAuthHeaders();
  if (!headers) throw new Error('Not authenticated');

  const config = getSupabaseConfig();
  if (!config.url) throw new Error('Supabase not configured');

  const response = await fetch(`${config.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const result = await response.json();
  return result[0];
}

export async function adminUpdate<T>(table: string, id: string, data: Partial<T>): Promise<T> {
  const headers = await getAdminAuthHeaders();
  if (!headers) throw new Error('Not authenticated');

  const config = getSupabaseConfig();
  if (!config.url) throw new Error('Supabase not configured');

  const response = await fetch(`${config.url}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const result = await response.json();
  return result[0];
}

export async function adminDelete(table: string, id: string): Promise<void> {
  const headers = await getAdminAuthHeaders();
  if (!headers) throw new Error('Not authenticated');

  const config = getSupabaseConfig();
  if (!config.url) throw new Error('Supabase not configured');

  const response = await fetch(`${config.url}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }
}

export async function adminReorder(table: string, items: { id: string; display_order: number }[]): Promise<void> {
  const headers = await getAdminAuthHeaders();
  if (!headers) throw new Error('Not authenticated');

  const config = getSupabaseConfig();
  if (!config.url) throw new Error('Supabase not configured');

  await Promise.all(items.map(item =>
    fetch(`${config.url}/rest/v1/${table}?id=eq.${item.id}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ display_order: item.display_order }),
    })
  ));
}

export async function adminToggleVisibility(table: string, id: string, isVisible: boolean): Promise<void> {
  await adminUpdate(table, id, { is_visible: isVisible } as any);
}

export async function adminToggleFeatured(table: string, id: string, isFeatured: boolean): Promise<void> {
  await adminUpdate(table, id, { is_featured: isFeatured } as any);
}

export async function uploadImage(bucket: string, file: File, path: string): Promise<string> {
  const headers = await getAdminAuthHeaders();
  if (!headers) throw new Error('Not authenticated');

  const config = getSupabaseConfig();
  if (!config.url) throw new Error('Supabase not configured');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', path);

  const response = await fetch(`${config.url}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': headers.Authorization,
      'apikey': headers.apikey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return `${config.url}/storage/v1/object/public/${bucket}/${path}`;
}

export async function deleteImage(bucket: string, path: string): Promise<void> {
  const headers = await getAdminAuthHeaders();
  if (!headers) throw new Error('Not authenticated');

  const config = getSupabaseConfig();
  if (!config.url) throw new Error('Supabase not configured');

  const response = await fetch(`${config.url}/storage/v1/object/${bucket}/${path}`, {
    method: 'DELETE',
    headers: {
      'Authorization': headers.Authorization,
      'apikey': headers.apikey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }
}