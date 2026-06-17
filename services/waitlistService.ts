import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * FOUNDER WAITLIST SERVICE
 * 
 * Handles all interactions with the Founder waitlist in Supabase.
 * Uses the PostgreSQL functions created in migration_v2.0_subscriptions.sql
 */

export interface WaitlistResponse {
    success: boolean;
    message?: string;
    error?: string;
    position?: number;
    spots_remaining?: number;
}

/**
 * Join the Founder waitlist
 * Calls the PostgreSQL function `join_founder_waitlist`
 */
export const joinFounderWaitlist = async (
    email: string,
    name?: string,
    businessType?: string
): Promise<WaitlistResponse> => {
    if (!isSupabaseConfigured()) {
        // Fallback for demo mode
        return {
            success: true,
            message: 'Benvenuto nella Founder Waitlist! (Demo Mode)',
            position: Math.floor(Math.random() * 50) + 1,
            spots_remaining: 21,
        };
    }

    try {
        const { data, error } = await supabase.rpc('join_founder_waitlist', {
            p_email: email.toLowerCase().trim(),
            p_name: name || null,
            p_business_type: businessType || null,
        });

        if (error) {
            console.error('Waitlist signup error:', error);
            return {
                success: false,
                error: error.message || 'Errore durante l\'iscrizione',
            };
        }

        // The function returns a JSON object
        return data as WaitlistResponse;
    } catch (err) {
        console.error('Waitlist error:', err);
        return {
            success: false,
            error: 'Errore di connessione. Riprova più tardi.',
        };
    }
};

/**
 * Get remaining Founder spots
 * Calls the PostgreSQL function `get_founder_spots_remaining`
 */
export const getFounderSpotsRemaining = async (): Promise<number> => {
    if (!isSupabaseConfigured()) {
        // Fallback for demo mode
        return 22;
    }

    try {
        const { data, error } = await supabase.rpc('get_founder_spots_remaining');

        if (error) {
            console.error('Get spots error:', error);
            return 22; // Fallback
        }

        return data as number;
    } catch (err) {
        console.error('Spots error:', err);
        return 22; // Fallback
    }
};

/**
 * Check if email is already in waitlist
 */
export const checkEmailInWaitlist = async (email: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
        return false;
    }

    try {
        const { data, error } = await supabase
            .from('founder_waitlist')
            .select('id')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();

        if (error) {
            console.error('Check email error:', error);
            return false;
        }

        return !!data;
    } catch (err) {
        console.error('Check email error:', err);
        return false;
    }
};

/**
 * Get subscription plans from database
 */
export const getSubscriptionPlans = async () => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');

        if (error) {
            console.error('Get plans error:', error);
            return null;
        }

        return data;
    } catch (err) {
        console.error('Plans error:', err);
        return null;
    }
};

export default {
    joinFounderWaitlist,
    getFounderSpotsRemaining,
    checkEmailInWaitlist,
    getSubscriptionPlans,
};
