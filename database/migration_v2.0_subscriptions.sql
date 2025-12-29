-- Luminel Manager v2.0 - Subscription System Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Add subscription fields to user_settings
-- ============================================
-- NOTE: This assumes you have a user_settings table. 
-- If your table is named differently (e.g., 'profiles'), change accordingly.

ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS is_founding_member BOOLEAN DEFAULT FALSE;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS founding_member_since TIMESTAMPTZ;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly';

-- Add constraint for valid tiers
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS valid_subscription_tier;
ALTER TABLE user_settings ADD CONSTRAINT valid_subscription_tier 
  CHECK (subscription_tier IN ('free', 'starter', 'pro', 'signature', 'empire'));

-- Add constraint for valid status
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS valid_subscription_status;
ALTER TABLE user_settings ADD CONSTRAINT valid_subscription_status 
  CHECK (subscription_status IN ('inactive', 'active', 'trial', 'past_due', 'canceled'));

-- ============================================
-- STEP 2: Create subscription_plans table
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'starter', 'pro', 'signature', 'empire'
  display_name TEXT NOT NULL,
  price_monthly_public DECIMAL(10,2) NOT NULL,
  price_monthly_founder DECIMAL(10,2) NOT NULL,
  price_annual_founder DECIMAL(10,2) NOT NULL,
  max_users INTEGER,
  max_clients INTEGER,
  max_sessions_per_month INTEGER,
  max_locations INTEGER DEFAULT 1,
  features JSONB,
  stripe_price_id_monthly TEXT,
  stripe_price_id_annual TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);

-- ============================================
-- STEP 3: Insert v2.0 pricing plans
-- ============================================
-- Use UPSERT to avoid duplicates
INSERT INTO subscription_plans (name, display_name, price_monthly_public, price_monthly_founder, price_annual_founder, max_users, max_clients, max_sessions_per_month, max_locations, sort_order, features)
VALUES 
  ('starter', 'LUMINA STARTER', 59, 39, 390, 1, 50, 100, 1, 1, 
   '["dashboard", "calendar", "crm_basic", "ai_coach_basic", "email_reminders", "mobile"]'::jsonb),
  ('pro', 'LUMINA PRO', 119, 79, 790, 5, 250, 500, 1, 2, 
   '["dashboard", "calendar", "crm_full", "ai_coach_pro", "whatsapp", "invoicing", "payments", "team_management", "pdf_export"]'::jsonb),
  ('signature', 'LUMINA SIGNATURE', 179, 109, 1090, 10, 500, -1, 2, 3, 
   '["dashboard", "calendar", "crm_full", "ai_coach_pro", "whatsapp", "invoicing", "payments", "team_management", "pdf_export", "inventory_basic", "loyalty", "api_readonly", "team_analytics"]'::jsonb),
  ('empire', 'LUMINA EMPIRE', 299, 179, 1790, -1, -1, -1, -1, 4, 
   '["dashboard", "calendar", "crm_full", "ai_coach_empire", "whatsapp", "invoicing", "payments", "team_management", "pdf_export", "inventory_full", "loyalty", "api_full", "team_analytics", "white_label", "success_manager", "onboarding"]'::jsonb)
ON CONFLICT (name) DO UPDATE SET
  price_monthly_public = EXCLUDED.price_monthly_public,
  price_monthly_founder = EXCLUDED.price_monthly_founder,
  price_annual_founder = EXCLUDED.price_annual_founder,
  max_users = EXCLUDED.max_users,
  max_clients = EXCLUDED.max_clients,
  features = EXCLUDED.features,
  updated_at = NOW();

-- ============================================
-- STEP 4: Create founder_waitlist table
-- ============================================
CREATE TABLE IF NOT EXISTS founder_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  business_type TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  converted_to_plan TEXT,
  notes TEXT
);

-- Add constraint for valid business types
ALTER TABLE founder_waitlist DROP CONSTRAINT IF EXISTS valid_business_type;
ALTER TABLE founder_waitlist ADD CONSTRAINT valid_business_type 
  CHECK (business_type IS NULL OR business_type IN ('parrucchiere', 'estetista', 'coach', 'tattoo', 'massaggio', 'altro'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_founder_waitlist_email ON founder_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_founder_waitlist_created ON founder_waitlist(created_at DESC);

-- ============================================
-- STEP 5: Enable RLS (Row Level Security)
-- ============================================
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_waitlist ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Create RLS Policies
-- ============================================

-- Plans: Everyone can read
DROP POLICY IF EXISTS "Plans are viewable by everyone" ON subscription_plans;
CREATE POLICY "Plans are viewable by everyone" 
  ON subscription_plans FOR SELECT 
  USING (true);

-- Waitlist: Anyone can INSERT (join waitlist)
DROP POLICY IF EXISTS "Anyone can join waitlist" ON founder_waitlist;
CREATE POLICY "Anyone can join waitlist" 
  ON founder_waitlist FOR INSERT 
  WITH CHECK (true);

-- Waitlist: Only authenticated admins can view/update
-- (You'll need to adjust this based on your admin role setup)
DROP POLICY IF EXISTS "Admins can view waitlist" ON founder_waitlist;
CREATE POLICY "Admins can view waitlist" 
  ON founder_waitlist FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'email' = 'admin@lumina.app');

DROP POLICY IF EXISTS "Admins can update waitlist" ON founder_waitlist;
CREATE POLICY "Admins can update waitlist" 
  ON founder_waitlist FOR UPDATE 
  USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'email' = 'admin@lumina.app');

-- ============================================
-- STEP 7: Create helper function for waitlist signup
-- ============================================
CREATE OR REPLACE FUNCTION public.join_founder_waitlist(
  p_email TEXT,
  p_name TEXT DEFAULT NULL,
  p_business_type TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_count INTEGER;
BEGIN
  -- Check if already registered
  SELECT COUNT(*) INTO v_count FROM founder_waitlist WHERE email = LOWER(p_email);
  
  IF v_count > 0 THEN
    RETURN json_build_object('success', false, 'error', 'Email già registrata nella waitlist');
  END IF;
  
  -- Insert new entry
  INSERT INTO founder_waitlist (email, name, business_type)
  VALUES (LOWER(p_email), p_name, p_business_type);
  
  -- Get current count for position
  SELECT COUNT(*) INTO v_count FROM founder_waitlist;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Benvenuto nella Founder Waitlist!',
    'position', v_count,
    'spots_remaining', GREATEST(0, 100 - v_count)
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute to anonymous users (for public waitlist signup)
GRANT EXECUTE ON FUNCTION public.join_founder_waitlist TO anon;
GRANT EXECUTE ON FUNCTION public.join_founder_waitlist TO authenticated;

-- ============================================
-- STEP 8: Create function to get waitlist count
-- ============================================
CREATE OR REPLACE FUNCTION public.get_founder_spots_remaining()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT GREATEST(0, 100 - COUNT(*)::INTEGER) FROM founder_waitlist;
$$;

GRANT EXECUTE ON FUNCTION public.get_founder_spots_remaining TO anon;
GRANT EXECUTE ON FUNCTION public.get_founder_spots_remaining TO authenticated;

-- ============================================
-- DONE! 
-- ============================================
-- After running this migration:
-- 1. Test the waitlist function: SELECT join_founder_waitlist('test@email.com', 'Test', 'coach');
-- 2. Check spots remaining: SELECT get_founder_spots_remaining();
-- 3. View plans: SELECT * FROM subscription_plans ORDER BY sort_order;
