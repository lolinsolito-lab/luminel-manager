-- Migration: Add pending_subscriptions table for marketing flow
-- Users who pay BEFORE registering are stored here temporarily

-- Create pending_subscriptions table
CREATE TABLE IF NOT EXISTS public.pending_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_tier TEXT NOT NULL,
    billing_cycle TEXT NOT NULL,
    is_founding_member BOOLEAN DEFAULT true,
    founding_member_number INTEGER,
    checkout_session_id TEXT,
    status TEXT DEFAULT 'pending', -- pending, claimed, expired
    created_at TIMESTAMPTZ DEFAULT NOW(),
    claimed_at TIMESTAMPTZ,
    claimed_by_user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.pending_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage (for webhook)
CREATE POLICY "Service role can manage pending_subscriptions"
    ON public.pending_subscriptions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Index for fast email lookup
CREATE INDEX IF NOT EXISTS idx_pending_subs_email ON public.pending_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_pending_subs_status ON public.pending_subscriptions(status);

-- Function to claim a pending subscription (called during registration)
CREATE OR REPLACE FUNCTION public.claim_pending_subscription(user_email TEXT, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    pending_sub RECORD;
BEGIN
    -- Find pending subscription for this email
    SELECT * INTO pending_sub
    FROM public.pending_subscriptions
    WHERE email = user_email AND status = 'pending'
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Update the user with subscription data
    UPDATE public.users
    SET 
        subscription_tier = pending_sub.subscription_tier,
        subscription_status = 'active',
        billing_cycle = pending_sub.billing_cycle,
        stripe_customer_id = pending_sub.stripe_customer_id,
        stripe_subscription_id = pending_sub.stripe_subscription_id,
        is_founding_member = pending_sub.is_founding_member,
        founding_member_since = pending_sub.created_at,
        founding_member_number = pending_sub.founding_member_number,
        updated_at = NOW()
    WHERE id = user_id;

    -- Mark the pending subscription as claimed
    UPDATE public.pending_subscriptions
    SET 
        status = 'claimed',
        claimed_at = NOW(),
        claimed_by_user_id = user_id
    WHERE id = pending_sub.id;

    RETURN TRUE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.claim_pending_subscription(TEXT, UUID) TO authenticated;

COMMENT ON TABLE public.pending_subscriptions IS 'Temporary storage for subscriptions from marketing flow (pay first, register later)';
