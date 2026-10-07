-- Matsya Shooting Sports Academy - Supabase/PostgreSQL Schema
-- This migration creates all tables for the academy website
-- Run this in your Supabase SQL Editor after creating the project

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. ADMIN USERS (for Supabase Auth integration)
-- ============================================================
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. ACADEMY CONTENT (Homepage/Public Content)
-- ============================================================
CREATE TABLE academy_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT UNIQUE NOT NULL,
    title TEXT,
    subtitle TEXT,
    content JSONB DEFAULT '{}',
    media JSONB DEFAULT '{}',
    is_visible BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. TRAINING RANGES
-- ============================================================
CREATE TABLE training_ranges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    distance TEXT NOT NULL,
    discipline TEXT,
    description TEXT,
    short_description TEXT,
    specifications JSONB DEFAULT '{}',
    equipment JSONB DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    capacity INTEGER,
    image_url TEXT,
    image_alt TEXT,
    is_visible BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. COACHES
-- ============================================================
CREATE TABLE coaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    role TEXT,
    bio TEXT,
    qualifications TEXT,
    certifications TEXT,
    experience_years INTEGER,
    photo_url TEXT,
    photo_alt TEXT,
    achievements TEXT,
    is_visible BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. FACILITIES
-- ============================================================
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT,
    description TEXT,
    short_description TEXT,
    specifications JSONB DEFAULT '{}',
    equipment JSONB DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    capacity INTEGER,
    image_url TEXT,
    image_alt TEXT,
    is_visible BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. ACHIEVEMENTS / MEDALISTS
-- ============================================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    medal TEXT NOT NULL CHECK (medal IN ('gold', 'silver', 'bronze', 'participation')),
    competition TEXT,
    event TEXT,
    discipline TEXT,
    position TEXT,
    year INTEGER,
    description TEXT,
    photo_url TEXT,
    photo_alt TEXT,
    is_visible BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. GALLERY IMAGES
-- ============================================================
CREATE TABLE gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    caption TEXT,
    category TEXT NOT NULL CHECK (category IN ('academy', 'training', 'competitions', 'events', 'facilities', 'achievements')),
    storage_path TEXT NOT NULL,
    storage_bucket TEXT DEFAULT 'gallery',
    image_url TEXT,
    alt_text TEXT,
    width INTEGER,
    height INTEGER,
    file_size_bytes INTEGER,
    mime_type TEXT,
    is_visible BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. REVIEWS / TESTIMONIALS
-- ============================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name TEXT,
    author_role TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    review_date DATE,
    photo_url TEXT,
    photo_alt TEXT,
    is_visible BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. REGISTRATIONS (for Phase 10)
-- ============================================================
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    age INTEGER,
    phone TEXT,
    email TEXT NOT NULL,
    city TEXT,
    interested_range TEXT,
    experience_level TEXT,
    message TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'completed', 'rejected')),
    admin_notes TEXT,
    source TEXT DEFAULT 'website',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. PAY & PLAY OPTIONS
-- ============================================================
CREATE TABLE pay_play_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price_amount INTEGER NOT NULL,
    price_currency TEXT DEFAULT 'INR',
    duration_minutes INTEGER,
    includes TEXT[] DEFAULT '{}',
    range_id UUID REFERENCES training_ranges(id) ON DELETE SET NULL,
    is_visible BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10b. PAY & PLAY BOOKINGS
-- ============================================================
CREATE TABLE pay_play_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    session_id UUID NOT NULL REFERENCES pay_play_options(id) ON DELETE RESTRICT,
    booking_date DATE,
    booking_time TIME,
    amount INTEGER NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_reference TEXT,
    payment_provider TEXT DEFAULT 'razorpay',
    payment_order_id TEXT,
    payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pay_play_bookings_session ON pay_play_bookings(session_id);
CREATE INDEX idx_pay_play_bookings_email ON pay_play_bookings(email);
CREATE INDEX idx_pay_play_bookings_payment_status ON pay_play_bookings(payment_status);
CREATE INDEX idx_pay_play_bookings_booking_status ON pay_play_bookings(booking_status);
CREATE INDEX idx_pay_play_bookings_payment_reference ON pay_play_bookings(payment_reference);

-- ============================================================
-- 11. MOTIVATIONAL QUOTES
-- ============================================================
CREATE TABLE motivational_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_text TEXT NOT NULL,
    author_name TEXT,
    number_prefix TEXT,
    is_visible BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. CONTACT SETTINGS
-- ============================================================
CREATE TABLE contact_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type TEXT DEFAULT 'text',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. SITE SECTION SETTINGS
-- ============================================================
CREATE TABLE site_section_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT UNIQUE NOT NULL,
    section_name TEXT,
    is_visible BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX idx_academy_content_section_key ON academy_content(section_key);
CREATE INDEX idx_training_ranges_slug ON training_ranges(slug);
CREATE INDEX idx_training_ranges_visible ON training_ranges(is_visible, display_order);
CREATE INDEX idx_coaches_slug ON coaches(slug);
CREATE INDEX idx_coaches_visible ON coaches(is_visible, display_order);
CREATE INDEX idx_facilities_slug ON facilities(slug);
CREATE INDEX idx_facilities_visible ON facilities(is_visible, display_order);
CREATE INDEX idx_achievements_slug ON achievements(slug);
CREATE INDEX idx_achievements_visible ON achievements(is_visible, display_order);
CREATE INDEX idx_achievements_medal ON achievements(medal);
CREATE INDEX idx_achievements_year ON achievements(year DESC);
CREATE INDEX idx_gallery_images_category ON gallery_images(category);
CREATE INDEX idx_gallery_images_visible ON gallery_images(is_visible, display_order);
CREATE INDEX idx_gallery_images_featured ON gallery_images(is_featured, display_order);
CREATE INDEX idx_reviews_visible ON reviews(is_visible, display_order);
CREATE INDEX idx_reviews_featured ON reviews(is_featured, display_order);
CREATE INDEX idx_registrations_status ON registrations(status, created_at DESC);
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_pay_play_visible ON pay_play_options(is_visible, display_order);
CREATE INDEX idx_motivational_visible ON motivational_quotes(is_visible, display_order);
CREATE INDEX idx_site_section_settings_key ON site_section_settings(section_key);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE academy_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_play_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivational_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_section_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_play_bookings ENABLE ROW LEVEL SECURITY;

-- Public read policies (anon role)
CREATE POLICY "Public read academy content" ON academy_content
    FOR SELECT USING (is_visible = true);

CREATE POLICY "Public read training ranges" ON training_ranges
    FOR SELECT USING (is_visible = true);

CREATE POLICY "Public read coaches" ON coaches
    FOR SELECT USING (is_visible = true);

CREATE POLICY "Public read facilities" ON facilities
    FOR SELECT USING (is_visible = true);

CREATE POLICY "Public read achievements" ON achievements
    FOR SELECT USING (is_visible = true);

CREATE POLICY "Public read gallery images" ON gallery_images
    FOR SELECT USING (is_visible = true);

CREATE POLICY "Public read reviews" ON reviews
    FOR SELECT USING (is_visible = true);

CREATE POLICY "Public read pay play options" ON pay_play_options
    FOR SELECT USING (is_visible = true);

CREATE POLICY "Public read motivational quotes" ON motivational_quotes
    FOR SELECT USING (is_visible = true);

CREATE POLICY "Public read contact settings" ON contact_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Public read site section settings" ON site_section_settings
    FOR SELECT USING (true);

-- Admin policies (authenticated admin users)
CREATE POLICY "Admin full access academy content" ON academy_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin full access training ranges" ON training_ranges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin full access coaches" ON coaches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin full access facilities" ON facilities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin full access achievements" ON achievements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin full access gallery images" ON gallery_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin full access reviews" ON reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin full access registrations" ON registrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin full access pay play options" ON pay_play_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin full access motivational quotes" ON motivational_quotes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin full access contact settings" ON contact_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin full access site section settings" ON site_section_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Public insert pay play bookings" ON pay_play_bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin full access pay play bookings" ON pay_play_bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

-- Registrations: public insert only (no read for anon)
CREATE POLICY "Public insert registrations" ON registrations
    FOR INSERT WITH CHECK (true);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_academy_content_updated_at BEFORE UPDATE ON academy_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_ranges_updated_at BEFORE UPDATE ON training_ranges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON coaches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_images_updated_at BEFORE UPDATE ON gallery_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pay_play_options_updated_at BEFORE UPDATE ON pay_play_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_motivational_quotes_updated_at BEFORE UPDATE ON motivational_quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_settings_updated_at BEFORE UPDATE ON contact_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_section_settings_updated_at BEFORE UPDATE ON site_section_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pay_play_bookings_updated_at BEFORE UPDATE ON pay_play_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STORAGE BUCKETS (to be created in Supabase Dashboard)
-- ============================================================
-- Buckets needed:
-- 1. 'gallery' - Gallery images (public read)
-- 2. 'coaches' - Coach photos (public read)
-- 3. 'achievements' - Achievement photos (public read)
-- 4. 'facilities' - Facility images (public read)
-- 5. 'academy' - Academy general images/logo (public read)
-- 6. 'uploads' - Temporary uploads for forms (private)

-- Storage policies to be created in Supabase Dashboard:
-- Public read for gallery, coaches, achievements, facilities, academy buckets
-- Authenticated insert/update/delete for admin users only