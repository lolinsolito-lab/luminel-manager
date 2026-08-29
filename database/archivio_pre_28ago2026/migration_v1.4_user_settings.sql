-- Migration: v1.4 User Settings
-- Description: Adds user_settings table for storing user preferences including cabin capacity
-- Date: 2025-12-28

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Business Profile
    business_name TEXT DEFAULT 'Luminel Center',
    tax_id TEXT,
    address TEXT,
    currency TEXT DEFAULT 'EUR',
    timezone TEXT DEFAULT 'Europe/Rome',
    email TEXT,
    website TEXT,
    
    -- Capacity Settings
    max_concurrent_appointments INTEGER DEFAULT 1,
    cabin_names TEXT[] DEFAULT ARRAY['Cabina Principale']::TEXT[],
    
    -- Schedule (JSON for flexibility)
    schedule JSONB DEFAULT '[
        {"day": "Monday", "active": true, "start": "09:00", "end": "17:00"},
        {"day": "Tuesday", "active": true, "start": "09:00", "end": "17:00"},
        {"day": "Wednesday", "active": true, "start": "10:00", "end": "18:00"},
        {"day": "Thursday", "active": true, "start": "09:00", "end": "17:00"},
        {"day": "Friday", "active": true, "start": "09:00", "end": "15:00"},
        {"day": "Saturday", "active": false, "start": "10:00", "end": "14:00"},
        {"day": "Sunday", "active": false, "start": "00:00", "end": "00:00"}
    ]'::JSONB,
    
    -- Integrations
    make_webhook TEXT,
    google_calendar_enabled BOOLEAN DEFAULT true,
    stripe_enabled BOOLEAN DEFAULT false,
    zoom_enabled BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- RLS Policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own settings
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_updated_at();

-- Comment
COMMENT ON TABLE user_settings IS 'Stores user preferences including business profile, capacity settings, schedule, and integrations';
