import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SubscriptionPlan, UserSubscription, SubscriptionTier } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

/**
 * SUBSCRIPTION CONTEXT
 * 
 * This context manages the user's subscription state throughout the app.
 * It determines:
 * - What tier the user has (free, starter, pro, signature, empire)
 * - Whether they are a Founding Member (locked-in pricing)
 * - What features are available
 * - What limits apply (clients, users, sessions, etc.)
 */

// Feature flags based on tier
type FeatureKey =
    | 'dashboard' | 'calendar' | 'crm_basic' | 'crm_full'
    | 'ai_coach_basic' | 'ai_coach_pro' | 'ai_coach_empire'
    | 'whatsapp' | 'invoicing' | 'payments' | 'team_management'
    | 'pdf_export' | 'inventory_basic' | 'inventory_full'
    | 'loyalty' | 'api_readonly' | 'api_full' | 'team_analytics'
    | 'white_label' | 'success_manager' | 'onboarding' | 'email_reminders' | 'mobile';

// Plan definitions with features and limits
const PLAN_DEFINITIONS: Record<SubscriptionTier, {
    displayName: string;
    features: FeatureKey[];
    limits: {
        maxUsers: number;    // -1 = unlimited
        maxClients: number;
        maxSessionsPerMonth: number;
        maxLocations: number;
    };
}> = {
    free: {
        displayName: 'Free Trial',
        features: ['dashboard', 'calendar', 'crm_basic'],
        limits: { maxUsers: 1, maxClients: 5, maxSessionsPerMonth: 10, maxLocations: 1 }
    },
    starter: {
        displayName: 'Starter',
        features: ['dashboard', 'calendar', 'crm_basic', 'ai_coach_basic', 'email_reminders', 'mobile'],
        limits: { maxUsers: 1, maxClients: 50, maxSessionsPerMonth: 100, maxLocations: 1 }
    },
    pro: {
        displayName: 'Pro',
        features: ['dashboard', 'calendar', 'crm_full', 'ai_coach_pro', 'whatsapp', 'invoicing', 'payments', 'team_management', 'pdf_export', 'email_reminders', 'mobile'],
        limits: { maxUsers: 5, maxClients: 250, maxSessionsPerMonth: 500, maxLocations: 1 }
    },
    signature: {
        displayName: 'Signature',
        features: ['dashboard', 'calendar', 'crm_full', 'ai_coach_pro', 'whatsapp', 'invoicing', 'payments', 'team_management', 'pdf_export', 'inventory_basic', 'loyalty', 'api_readonly', 'team_analytics', 'email_reminders', 'mobile'],
        limits: { maxUsers: 10, maxClients: 500, maxSessionsPerMonth: -1, maxLocations: 2 }
    },
    empire: {
        displayName: 'Empire',
        features: ['dashboard', 'calendar', 'crm_full', 'ai_coach_empire', 'whatsapp', 'invoicing', 'payments', 'team_management', 'pdf_export', 'inventory_full', 'loyalty', 'api_full', 'team_analytics', 'white_label', 'success_manager', 'onboarding', 'email_reminders', 'mobile'],
        limits: { maxUsers: -1, maxClients: -1, maxSessionsPerMonth: -1, maxLocations: -1 }
    }
};

interface SubscriptionContextType {
    // Current subscription state
    subscription: UserSubscription;
    isLoading: boolean;

    // Helper methods
    hasFeature: (feature: FeatureKey) => boolean;
    canAddClient: (currentCount: number) => boolean;
    canAddUser: (currentCount: number) => boolean;
    canAddLocation: (currentCount: number) => boolean;
    getLimit: (limitType: 'users' | 'clients' | 'sessions' | 'locations') => number;

    // Tier info
    tierName: string;
    isFoundingMember: boolean;
    isPaidTier: boolean;

    // Upgrade prompts
    getUpgradeReason: (feature: FeatureKey) => string | null;

    // For demo/testing - manually set tier
    setDemoTier: (tier: SubscriptionTier, isFounder?: boolean) => void;
}

const defaultSubscription: UserSubscription = {
    tier: 'free',
    status: 'inactive',
    billingCycle: 'monthly',
    isFoundingMember: false,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [subscription, setSubscription] = useState<UserSubscription>(defaultSubscription);
    const [isLoading, setIsLoading] = useState(true);

    // Load subscription from Supabase (priority) or localStorage (fallback)
    useEffect(() => {
        const loadSubscription = async () => {
            try {
                // 1. Check URL parameters for temporary demo/sync (useful for testing)
                const params = new URLSearchParams(window.location.search);
                const tierParam = params.get('tier') as SubscriptionTier | null;
                const founderParam = params.get('founder') === 'true';

                if (tierParam && PLAN_DEFINITIONS[tierParam]) {
                    const newSub: UserSubscription = {
                        tier: tierParam,
                        status: 'active',
                        billingCycle: 'monthly',
                        isFoundingMember: founderParam,
                        foundingMemberSince: founderParam ? new Date().toISOString() : undefined,
                    };
                    setSubscription(newSub);
                    localStorage.setItem('lumina_subscription', JSON.stringify(newSub));
                    const newUrl = window.location.pathname + window.location.hash;
                    window.history.replaceState({}, '', newUrl);
                    setIsLoading(false);
                    return;
                }

                // 2. Try to fetch from Supabase if configured and user is logged in
                if (isSupabaseConfigured()) {
                    const { data: { user } } = await supabase.auth.getUser();

                    if (user) {
                        const { data: userData, error } = await supabase
                            .from('users')
                            .select('subscription_tier, subscription_status, is_founding_member, founding_member_since, founding_member_number, billing_cycle')
                            .eq('id', user.id)
                            .single();

                        if (!error && userData) {
                            const dbSub: UserSubscription = {
                                tier: (userData.subscription_tier as SubscriptionTier) || 'free',
                                status: userData.subscription_status || 'inactive',
                                billingCycle: (userData.billing_cycle as 'monthly' | 'annual') || 'monthly',
                                isFoundingMember: userData.is_founding_member || false,
                                foundingMemberSince: userData.founding_member_since,
                                foundingMemberNumber: userData.founding_member_number,
                            };
                            setSubscription(dbSub);
                            // Also cache in localStorage for faster subsequent loads
                            localStorage.setItem('lumina_subscription', JSON.stringify(dbSub));
                            setIsLoading(false);
                            return;
                        }
                    }
                }

                // 3. Fallback to localStorage for demo/dev mode
                const savedSub = localStorage.getItem('lumina_subscription');
                if (savedSub) {
                    setSubscription(JSON.parse(savedSub));
                }

            } catch (error) {
                console.error('Error loading subscription:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSubscription();

        // Also listen for auth state changes to reload subscription
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(() => {
            loadSubscription();
        });

        return () => {
            authSubscription.unsubscribe();
        };
    }, []);

    // Check if user has a specific feature
    const hasFeature = useCallback((feature: FeatureKey): boolean => {
        const plan = PLAN_DEFINITIONS[subscription.tier];
        return plan.features.includes(feature);
    }, [subscription.tier]);

    // Check limits
    const getLimit = useCallback((limitType: 'users' | 'clients' | 'sessions' | 'locations'): number => {
        const plan = PLAN_DEFINITIONS[subscription.tier];
        switch (limitType) {
            case 'users': return plan.limits.maxUsers;
            case 'clients': return plan.limits.maxClients;
            case 'sessions': return plan.limits.maxSessionsPerMonth;
            case 'locations': return plan.limits.maxLocations;
        }
    }, [subscription.tier]);

    const canAddClient = useCallback((currentCount: number): boolean => {
        const limit = getLimit('clients');
        return limit === -1 || currentCount < limit;
    }, [getLimit]);

    const canAddUser = useCallback((currentCount: number): boolean => {
        const limit = getLimit('users');
        return limit === -1 || currentCount < limit;
    }, [getLimit]);

    const canAddLocation = useCallback((currentCount: number): boolean => {
        const limit = getLimit('locations');
        return limit === -1 || currentCount < limit;
    }, [getLimit]);

    // Get upgrade message for locked features
    const getUpgradeReason = useCallback((feature: FeatureKey): string | null => {
        if (hasFeature(feature)) return null;

        const featureNames: Record<FeatureKey, string> = {
            dashboard: 'Dashboard',
            calendar: 'Calendario',
            crm_basic: 'CRM Base',
            crm_full: 'CRM Completo',
            ai_coach_basic: 'AI Coach Base',
            ai_coach_pro: 'AI Coach Pro',
            ai_coach_empire: 'AI Coach Empire',
            whatsapp: 'WhatsApp Automation',
            invoicing: 'Fatturazione Elettronica',
            payments: 'Pagamenti Online',
            team_management: 'Gestione Team',
            pdf_export: 'Export PDF',
            inventory_basic: 'Inventario Base',
            inventory_full: 'Inventario Completo',
            loyalty: 'Programma Fedeltà',
            api_readonly: 'API Read-Only',
            api_full: 'API Full Access',
            team_analytics: 'Analytics Team',
            white_label: 'White Label',
            success_manager: 'Success Manager',
            onboarding: 'Onboarding 1:1',
            email_reminders: 'Email Reminder',
            mobile: 'Mobile Access'
        };

        // Find which tier unlocks this feature
        const tiers: SubscriptionTier[] = ['starter', 'pro', 'signature', 'empire'];
        for (const tier of tiers) {
            if (PLAN_DEFINITIONS[tier].features.includes(feature)) {
                return `Passa a ${PLAN_DEFINITIONS[tier].displayName} per sbloccare ${featureNames[feature]}`;
            }
        }
        return null;
    }, [hasFeature]);

    // Demo/testing: manually set tier
    const setDemoTier = useCallback((tier: SubscriptionTier, isFounder: boolean = false) => {
        const newSub: UserSubscription = {
            tier,
            status: tier === 'free' ? 'inactive' : 'active',
            billingCycle: 'monthly',
            isFoundingMember: isFounder,
            foundingMemberSince: isFounder ? new Date().toISOString() : undefined,
        };
        setSubscription(newSub);
        localStorage.setItem('lumina_subscription', JSON.stringify(newSub));
    }, []);

    const value: SubscriptionContextType = {
        subscription,
        isLoading,
        hasFeature,
        canAddClient,
        canAddUser,
        canAddLocation,
        getLimit,
        tierName: PLAN_DEFINITIONS[subscription.tier].displayName,
        isFoundingMember: subscription.isFoundingMember,
        isPaidTier: subscription.tier !== 'free',
        getUpgradeReason,
        setDemoTier,
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};

// Hook to use subscription context
export const useSubscription = (): SubscriptionContextType => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};

// Utility hook for feature gating
export const useFeatureGate = (feature: FeatureKey) => {
    const { hasFeature, getUpgradeReason } = useSubscription();
    return {
        isEnabled: hasFeature(feature),
        upgradeMessage: getUpgradeReason(feature),
    };
};
