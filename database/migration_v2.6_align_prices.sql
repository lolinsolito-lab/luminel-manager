-- =============================================
-- LUMINEL EMPIRE - Pricing Alignment Strategy
-- Migration v2.6: Align prices with Stripe / UI settings
-- =============================================

-- Update subscription plans with final price points:
-- STARTER: Public €59/m, Founder €33/m, Founder Annual €330/y
-- PRO: Public €99/m, Founder €55/m, Founder Annual €550/y
-- SIGNATURE: Public €159/m, Founder €88/m, Founder Annual €880/y
-- EMPIRE: Public €249/m, Founder €138/m, Founder Annual €1380/y

-- Update STARTER
UPDATE subscription_plans
SET 
  price_monthly_public = 59.00,
  price_monthly_founder = 33.00,
  price_annual_founder = 330.00,
  updated_at = NOW()
WHERE name = 'starter';

-- Update PRO
UPDATE subscription_plans
SET 
  price_monthly_public = 99.00,
  price_monthly_founder = 55.00,
  price_annual_founder = 550.00,
  updated_at = NOW()
WHERE name = 'pro';

-- Update SIGNATURE
UPDATE subscription_plans
SET 
  price_monthly_public = 159.00,
  price_monthly_founder = 88.00,
  price_annual_founder = 880.00,
  updated_at = NOW()
WHERE name = 'signature';

-- Update EMPIRE
UPDATE subscription_plans
SET 
  price_monthly_public = 249.00,
  price_monthly_founder = 138.00,
  price_annual_founder = 1380.00,
  updated_at = NOW()
WHERE name = 'empire';

-- Check update output
SELECT name, price_monthly_public, price_monthly_founder, price_annual_founder FROM subscription_plans;
