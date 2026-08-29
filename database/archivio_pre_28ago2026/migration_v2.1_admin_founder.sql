-- =============================================
-- LUMINEL EMPIRE - Admin Founder Profile Setup
-- Migration v2.1: Set Admin as Founder #1
-- =============================================

-- This migration sets up the creator/admin as Founding Member #1
-- with full Empire access. Run this AFTER the user has registered.

-- Update the admin user's subscription profile
-- Replace 'YOUR_ADMIN_USER_ID' with your actual Supabase auth.id after registration

-- Option 1: Update by email (recommended)
UPDATE public.users
SET 
    subscription_tier = 'empire',
    subscription_status = 'active',
    is_founding_member = true,
    founding_member_since = '2024-12-29',
    founding_member_number = 1,
    updated_at = NOW()
WHERE email = 'admin@luminel.it'; -- Replace with your admin email

-- Option 2: If you know the user ID
-- UPDATE public.users
-- SET 
--     subscription_tier = 'empire',
--     subscription_status = 'active',
--     is_founding_member = true,
--     founding_member_since = '2024-12-29',
--     founding_member_number = 1,
--     updated_at = NOW()
-- WHERE id = 'YOUR_SUPABASE_AUTH_USER_ID';

-- Verify the update
SELECT id, email, subscription_tier, is_founding_member, founding_member_number
FROM public.users
WHERE is_founding_member = true;
