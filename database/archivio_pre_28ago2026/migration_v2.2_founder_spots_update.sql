-- =============================================
-- LUMINEL EMPIRE - Update Founder Spots Function
-- Migration v2.2: Count founders from BOTH waitlist AND paid users
-- =============================================

-- Drop the old function
DROP FUNCTION IF EXISTS public.get_founder_spots_remaining();

-- Create new function that counts:
-- 1. Users in the founder_waitlist
-- 2. Users in public.users with is_founding_member = true
CREATE OR REPLACE FUNCTION public.get_founder_spots_remaining()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT GREATEST(0, 100 - (
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
