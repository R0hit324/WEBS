-- Pay & Play Enhancements Migration
-- Adds additional fields for complete admin management of Pay & Play sessions

-- Add new columns to pay_play_options table
ALTER TABLE pay_play_options 
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'unavailable', 'temporarily_closed')),
ADD COLUMN IF NOT EXISTS instructions TEXT,
ADD COLUMN IF NOT EXISTS rules TEXT,
ADD COLUMN IF NOT EXISTS notices TEXT,
ADD COLUMN IF NOT EXISTS heading TEXT,
ADD COLUMN IF NOT EXISTS subheading TEXT,
ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}';

-- Add index for availability status
CREATE INDEX IF NOT EXISTS idx_pay_play_availability ON pay_play_options(availability_status);

-- Update pay_play_bookings: remove payment_status column references in RLS if needed
-- Note: We keep the column but will not use it in the admin UI

-- Add comment to document the changes
COMMENT ON COLUMN pay_play_options.start_time IS 'Session start time (e.g., 09:00)';
COMMENT ON COLUMN pay_play_options.end_time IS 'Session end time (e.g., 11:00)';
COMMENT ON COLUMN pay_play_options.availability_status IS 'Session availability: available, unavailable, temporarily_closed';
COMMENT ON COLUMN pay_play_options.instructions IS 'General instructions for the session';
COMMENT ON COLUMN pay_play_options.rules IS 'Rules and regulations for the session';
COMMENT ON COLUMN pay_play_options.notices IS 'Important notices for participants';
COMMENT ON COLUMN pay_play_options.heading IS 'Custom heading for the public page';
COMMENT ON COLUMN pay_play_options.subheading IS 'Custom subheading for the public page';
COMMENT ON COLUMN pay_play_options.details IS 'Additional flexible details as JSON';