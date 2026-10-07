/**
 * Database Types for Matsya Shooting Sports Academy
 * Generated from Supabase schema
 */

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface VisibilityEntity {
  is_visible: boolean;
  display_order: number;
}

export interface FeaturedEntity {
  is_featured: boolean;
}

// ============================================================
// Admin Users
// ============================================================
export type AdminRole = 'admin' | 'editor' | 'viewer';

export interface AdminUser extends BaseEntity {
  email: string;
  full_name: string | null;
  role: AdminRole;
  is_active: boolean;
  last_login: string | null;
}

// ============================================================
// Academy Content
// ============================================================
export interface AcademyContent extends BaseEntity, VisibilityEntity {
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown>;
  media: Record<string, unknown>;
}

// ============================================================
// Training Ranges
// ============================================================
export interface TrainingRange extends BaseEntity, VisibilityEntity {
  name: string;
  slug: string;
  distance: string;
  discipline: string | null;
  description: string | null;
  short_description: string | null;
  specifications: Record<string, unknown>;
  equipment: Record<string, unknown>;
  features: string[];
  capacity: number | null;
  image_url: string | null;
  image_alt: string | null;
}

// ============================================================
// Coaches
// ============================================================
export interface Coach extends BaseEntity, VisibilityEntity, FeaturedEntity {
  full_name: string;
  slug: string;
  role: string | null;
  bio: string | null;
  qualifications: string | null;
  certifications: string | null;
  experience_years: number | null;
  photo_url: string | null;
  photo_alt: string | null;
  achievements: string | null;
}

// ============================================================
// Facilities
// ============================================================
export interface Facility extends BaseEntity, VisibilityEntity, FeaturedEntity {
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  short_description: string | null;
  specifications: Record<string, unknown>;
  equipment: Record<string, unknown>;
  features: string[];
  capacity: number | null;
  image_url: string | null;
  image_alt: string | null;
}

// ============================================================
// Achievements
// ============================================================
export type MedalType = 'gold' | 'silver' | 'bronze' | 'participation';

export interface Achievement extends BaseEntity, VisibilityEntity, FeaturedEntity {
  athlete_name: string;
  slug: string;
  medal: MedalType;
  competition: string | null;
  event: string | null;
  discipline: string | null;
  position: string | null;
  year: number | null;
  description: string | null;
  photo_url: string | null;
  photo_alt: string | null;
}

// ============================================================
// Gallery Images
// ============================================================
export type GalleryCategory = 'academy' | 'training' | 'competitions' | 'events' | 'facilities' | 'achievements';

export interface GalleryImage extends BaseEntity, VisibilityEntity, FeaturedEntity {
  title: string | null;
  caption: string | null;
  category: GalleryCategory;
  storage_path: string;
  storage_bucket: string;
  image_url: string | null;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  file_size_bytes: number | null;
  mime_type: string | null;
}

// ============================================================
// Reviews
// ============================================================
export interface Review extends BaseEntity, VisibilityEntity, FeaturedEntity {
  author_name: string | null;
  author_role: string | null;
  rating: number | null;
  review_text: string;
  review_date: string | null;
  photo_url: string | null;
  photo_alt: string | null;
}

// ============================================================
// Registrations
// ============================================================
export type RegistrationStatus = 'new' | 'contacted' | 'completed' | 'rejected';

export interface Registration extends BaseEntity {
  full_name: string;
  age: number | null;
  phone: string | null;
  email: string;
  city: string | null;
  interested_range: string | null;
  experience_level: string | null;
  message: string | null;
  status: RegistrationStatus;
  admin_notes: string | null;
  source: string;
}

// ============================================================
// Pay & Play Options
// ============================================================
export interface PayPlayOption extends BaseEntity, VisibilityEntity {
  name: string;
  slug: string;
  description: string | null;
  price_amount: number;
  price_currency: string;
  duration_minutes: number | null;
  includes: string[];
  range_id: string | null;
}

// ============================================================
// Motivational Quotes
// ============================================================
export interface MotivationalQuote extends BaseEntity, VisibilityEntity {
  quote_text: string;
  author_name: string | null;
  number_prefix: string | null;
}

// ============================================================
// Contact Settings
// ============================================================
export interface ContactSetting extends BaseEntity {
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  is_public: boolean;
}

// ============================================================
// Site Section Settings
// ============================================================
export interface SiteSectionSetting extends BaseEntity, VisibilityEntity {
  section_key: string;
  section_name: string | null;
  settings: Record<string, unknown>;
}

// ============================================================
// API Response Types
// ============================================================
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================
// Form Validation Types
// ============================================================
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

export interface RegistrationFormData {
  full_name: string;
  age: number | null;
  phone: string;
  email: string;
  city: string;
  interested_range: string;
  experience_level: string;
  message: string;
}

// ============================================================
// Supabase Client Types
// ============================================================
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export type SupabaseClient = unknown; // Will be typed when @supabase/supabase-js is installed