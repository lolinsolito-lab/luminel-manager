-- =============================================
-- LUMINEL EMPIRE - Schema Update for Founders
-- Migration v2.1a: Add subscription columns to users table
-- =============================================
-- Run this FIRST, then run migration_v2.1_admin_founder.sql

-- Step 1: Add the missing columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_founding_member BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS founding_member_since TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS founding_member_number INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly';

-- Step 2: Fix existing data before adding constraints
-- Set any NULL or invalid tier to 'free'
UPDATE public.users 
SET subscription_tier = 'free' 
WHERE subscription_tier IS NULL 
   OR subscription_tier NOT IN ('free', 'starter', 'pro', 'signature', 'empire');

-- Set any NULL or invalid status to 'inactive'
UPDATE public.users 
SET subscription_status = 'inactive' 
WHERE subscription_status IS NULL 
   OR subscription_status NOT IN ('inactive', 'active', 'trial', 'past_due', 'canceled');

-- Step 3: Now add constraints (after data is clean)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS valid_subscription_tier;
ALTER TABLE public.users ADD CONSTRAINT valid_subscription_tier 
  CHECK (subscription_tier IN ('free', 'starter', 'pro', 'signature', 'empire'));

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS valid_subscription_status;
ALTER TABLE public.users ADD CONSTRAINT valid_subscription_status 
  CHECK (subscription_status IN ('inactive', 'active', 'trial', 'past_due', 'canceled'));

-- Step 4: Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('subscription_tier', 'is_founding_member', 'founding_member_number');
