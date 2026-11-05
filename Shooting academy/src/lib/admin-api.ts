import { getSupabaseConfig, TABLES } from '@/lib/supabase';
import { getAdminAuthHeaders, getRememberedAdminRole } from '@/lib/admin-auth';

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

// UX-level write gate enforced before any mutating request leaves the app
// (viewer role, or role unknown because the route-guard role check was
// unavailable). Defense-in-depth only: the Supabase `can_admin_write()` RLS
// policy remains the real security boundary; requests blocked here would be
// rejected server-side anyway.
function assertCanWrite(): void {
  const role = getRememberedAdminRole();
  if (role !== 'admin' && role !== 'editor') {
    throw new Error('Read-only access: your role does not permit this operation.');
  }
}

export async function adminFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAdminAuthHeaders();
  if (!headers) throw new Error('Not authenticated');
  if (options.method && options.method !== 'GET') assertCanWrite();

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

  if (!countResponse.ok) {
    const errorText = await countResponse.text();
    throw new Error(errorText || `Failed to load ${table} (${countResponse.status})`);
  }

  const totalCount = parseInt(countResponse.headers.get('content-range')?.split('/')[1] || '0', 10);

  const response = await fetch(`${config.url}/rest/v1/${table}?${queryParams.toString()}`, { headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Failed to load ${table} (${response.status})`);
  }

  const data = await response.json();

  return {
    data: Array.isArray(data) ? data : [],
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
  assertCanWrite();
  const headers = await getAdminAuthHeaders();
  if (!headers) throw new Error('Not authenticated');

  const config = getSupabaseConfig();
  if (!config.url) throw new Error('Supabase not configured');

  const response = await fetch(`${config.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
  ...headers,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
},
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
  assertCanWrite();
  const headers = await getAdminAuthHeaders();
  if (!headers) throw new Error('Not authenticated');

  const config = getSupabaseConfig();
  if (!config.url) throw new Error('Supabase not configured');

  const response = await fetch(`${config.url}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
  ...headers,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
},
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
  assertCanWrite();
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
  assertCanWrite();
  const headers = await getAdminAuthHeaders();
  if (!headers) throw new Error('Not authenticated');

  const config = getSupabaseConfig();
  if (!config.url) throw new Error('Supabase not configured');

  await Promise.all(items.map(item =>
    fetch(`${config.url}/rest/v1/${table}?id=eq.${item.id}`, {
      method: 'PATCH',
      headers: {
  ...headers,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
},
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


/* ============================================================
 * Image upload hardening (VUL-005)
 *
 * The browser-reported file.type and file extension are both client
 * claims, not facts: anything can be renamed. Storage objects are
 * served publicly by Content-Type, so a malicious upload could be
 * stored as image/svg+xml or text/html and execute on direct
 * navigation (stored XSS). Uploads are therefore validated by
 * magic bytes, capped in size, and both the served Content-Type and
 * the object path extension are derived from the sniffed type —
 * never from the file name.
 * SVG is rejected outright: it is XML that can carry script and is
 * live-rendered on direct navigation; GIF cannot execute script.
 * ============================================================ */

export const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const IMAGE_MAGIC: { mime: string; ext: string; test: (b: Uint8Array) => boolean }[] = [
  { mime: 'image/jpeg', ext: 'jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/png', ext: 'png', test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { mime: 'image/gif', ext: 'gif', test: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 },
  {
    mime: 'image/webp',
    ext: 'webp',
    test: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46
      && String.fromCharCode(b[8], b[9], b[10], b[11]) === 'WEBP',
  },
];

export async function sniffImageType(file: File | Blob): Promise<{ mime: string; ext: string } | null> {
  try {
    const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const match = IMAGE_MAGIC.find(t => t.test(head));
    return match ? { mime: match.mime, ext: match.ext } : null;
  } catch {
    return null;
  }
}

/**
 * Validates an image upload and returns a Blob already typed with the
 * sniffed MIME plus a randomised path with the sniffed extension.
 * Caller must NOT use the original file name for path/type decisions.
 */
export async function prepareImageUpload(
  file: File | Blob,
  folder: string
): Promise<{ blob: Blob; path: string }> {
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    const mb = Math.floor(IMAGE_UPLOAD_MAX_BYTES / (1024 * 1024));
    throw new Error(`Image is too large (max ${mb} MB). Please compress it and try again.`);
  }
  const sniffed = await sniffImageType(file);
  if (!sniffed) {
    throw new Error('Unsupported image format. Use JPG, PNG, GIF or WebP.');
  }
  const path = folder
    ? `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${sniffed.ext}`
    : `${Date.now()}-${Math.random().toString(36).slice(2)}.${sniffed.ext}`;
  return { blob: new Blob([file], { type: sniffed.mime }), path };
}

export async function uploadImage(
  bucket: string,
  file: File | Blob,
  path: string
): Promise<string> {
  assertCanWrite();
  const headers = await getAdminAuthHeaders();

  if (!headers) {
    throw new Error('Not authenticated');
  }

  const config = getSupabaseConfig();

  if (!config.url) {
    throw new Error('Supabase not configured');
  }

  // Defence in depth: the caller is expected to pass a prepared blob,
  // but every upload is re-validated here on size and magic bytes, and
  // the Content-Type served by storage is taken from the sniffed type.
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    const mb = Math.floor(IMAGE_UPLOAD_MAX_BYTES / (1024 * 1024));
    throw new Error(`Image is too large (max ${mb} MB). Please compress it and try again.`);
  }
  const sniffed = await sniffImageType(file);
  if (!sniffed) {
    throw new Error('Unsupported image format. Use JPG, PNG, GIF or WebP.');
  }

  const cleanPath = path
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');

  const response = await fetch(
    `${config.url}/storage/v1/object/${encodeURIComponent(bucket)}/${cleanPath}`,
    {
      method: 'POST',
      headers: {
        'Authorization': headers.Authorization,
        'apikey': headers.apikey,
        'Content-Type': sniffed.mime,
        'x-upsert': 'false',
      },
      body: file,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Image upload failed (${response.status}): ${errorText}`);
  }

  return `${config.url}/storage/v1/object/public/${encodeURIComponent(bucket)}/${cleanPath}`;
}


export async function deleteImage(bucket: string, path: string): Promise<void> {
  assertCanWrite();
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
