/**
 * Supabase Client Configuration
 * Matsya Shooting Sports Academy
 * 
 * IMPORTANT: Never commit real credentials to source control.
 * Use environment variables for all sensitive configuration.
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseConfig } from '../types/database';

/**
 * Get Supabase configuration from environment variables
 */
export function getSupabaseConfig(): SupabaseConfig {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn(
      'Supabase configuration missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
    );
  }

  return {
    url: url || '',
    anonKey: anonKey || '',
    // Service role key should NEVER be exposed to the browser
    // It is only used in backend/edge functions
  };
}

/**
 * Supabase client instance (lazy initialization)
 */
let supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * Get or create the Supabase client instance
 */
export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const config = getSupabaseConfig();
  
  if (!config.url || !config.anonKey) {
    throw new Error('Supabase configuration not available. Please set environment variables.');
  }

  supabaseClient = createClient(config.url, config.anonKey);
  
  return supabaseClient;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

/**
 * Storage bucket names
 */
export const STORAGE_BUCKETS = {
  GALLERY: 'gallery',
  COACHES: 'coaches',
  ACHIEVEMENTS: 'achievements',
  FACILITIES: 'facilities',
  ACADEMY: 'academy',
  UPLOADS: 'uploads',
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

/**
 * Public URL helpers for storage
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const config = getSupabaseConfig();
  if (!config.url) return '';
  return `${config.url}/storage/v1/object/public/${bucket}/${path}`;
}

export function getSignedUrl(bucket: StorageBucket, path: string, expiresIn = 3600): string {
  const client = getSupabaseClient();
  const { data, error } = client.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error || !data) return '';
  return data.signedUrl;
}

/**
 * Database table names
 */
export const TABLES = {
  ADMIN_USERS: 'admin_users',
  ACADEMY_CONTENT: 'academy_content',
  TRAINING_RANGES: 'training_ranges',
  COACHES: 'coaches',
  FACILITIES: 'facilities',
  ACHIEVEMENTS: 'achievements',
  GALLERY_IMAGES: 'gallery_images',
  REVIEWS: 'reviews',
  REGISTRATIONS: 'registrations',
  PAY_PLAY_OPTIONS: 'pay_play_options',
  MOTIVATIONAL_QUOTES: 'motivational_quotes',
  CONTACT_SETTINGS: 'contact_settings',
  SITE_SECTION_SETTINGS: 'site_section_settings',
} as const;

export type TableName = typeof TABLES[keyof typeof TABLES];

/**
 * RLS Policy helpers
 */
export const RLS_POLICIES = {
  PUBLIC_READ: 'public_read',
  ADMIN_ALL: 'admin_all',
  PUBLIC_INSERT: 'public_insert',
} as const;

/**
 * Get admin auth headers for API requests
 */
export function getAdminAuthHeaders() {
  const session = getAdminSession();
  if (!session) return null;

  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return null;

  return {
    Authorization: `Bearer ${session.access_token}`,
    apikey: config.anonKey,
  };
}

/**
 * Get admin session from localStorage
 */
export function getAdminSession() {
  try {
    const stored = localStorage.getItem('matsya_admin_session');
    if (!stored) return null;

    const session = JSON.parse(stored);

    if (Date.now() > session.expires_at - 60000) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}