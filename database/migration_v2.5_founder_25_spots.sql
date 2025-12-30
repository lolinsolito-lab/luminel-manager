-- =============================================
-- LUMINEL EMPIRE - Founder Strategy Update
-- Migration v2.5: Reduce to 25 spots (Premium Scarcity)
-- =============================================

-- Update the function to use 25 spots instead of 100
DROP FUNCTION IF EXISTS public.get_founder_spots_remaining();

CREATE OR REPLACE FUNCTION public.get_founder_spots_remaining()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT GREATEST(0, 25 - (
    -- Count waitlist entries  
    (SELECT COUNT(*) FROM founder_waitlist)::INTEGER 
    + 
    -- Count paid founding members
    (SELECT COUNT(*) FROM public.users WHERE is_founding_member = true)::INTEGER
  ));
$$;

-- Grant access
GRANT EXECUTE ON FUNCTION public.get_founder_spots_remaining TO anon;
GRANT EXECUTE ON FUNCTION public.get_founder_spots_remaining TO authenticated;

-- Test the function
SELECT get_founder_spots_remaining() AS remaining_spots;

-- =============================================
-- STRIPE PRICING NOTE:
-- You need to create NEW Stripe products with these prices:
-- 
-- STARTER: €33/month (€330/year)
-- PRO: €55/month (€550/year) 
-- SIGNATURE: €88/month (€880/year)
-- EMPIRE: €138/month (€1380/year)
--
-- Then update stripe_prices.json with the new price IDs
-- =============================================
