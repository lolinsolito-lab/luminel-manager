-- =============================================
-- LUMINA EMPIRE - Add logo_url to user_settings
-- =============================================
-- Execute this in your Supabase SQL Editor
-- =============================================

-- Add logo_url column if it doesn't exist
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '';

-- Comment
COMMENT ON COLUMN user_settings.logo_url IS 'URL of the business logo stored in Supabase Storage';
