// ==============================================
// LUMINEL EMPIRE - Subscription Tier Limits
// Configuration for feature gating per tier
// ==============================================

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'signature' | 'empire';

export interface TierLimits {
    // Core limits
    maxClients: number;
    maxSessionsPerMonth: number;
    maxResources: number;
    maxTeamMembers: number;
    maxLocations: number;

    // Feature flags
    canGeneratePDF: boolean;
    canSendEmails: boolean;
    canUseWhatsApp: boolean;
    canUseCalendarSync: boolean;
    canUseAnalytics: 'none' | 'basic' | 'standard' | 'advanced' | 'executive';
    canWhiteLabel: boolean;
    canUseAPI: boolean;

    // Branding
    showUpgradeBanner: boolean;
    pdfWatermark: boolean;
}

// Tier configuration following the marketing strategy
export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
    free: {
        maxClients: 5,
        maxSessionsPerMonth: 10,
        maxResources: 3,
        maxTeamMembers: 0,
        maxLocations: 1,

        canGeneratePDF: false,
        canSendEmails: false,
        canUseWhatsApp: false,
        canUseCalendarSync: false,
        canUseAnalytics: 'basic',
        canWhiteLabel: false,
        canUseAPI: false,

        showUpgradeBanner: true,
        pdfWatermark: true,
    },

    starter: {
        maxClients: 50,
        maxSessionsPerMonth: 100,
        maxResources: 20,
        maxTeamMembers: 1,
        maxLocations: 1,

        canGeneratePDF: true,
        canSendEmails: true, // Limited: 50/month
        canUseWhatsApp: false,
        canUseCalendarSync: true,
        canUseAnalytics: 'standard',
        canWhiteLabel: false,
        canUseAPI: false,

        showUpgradeBanner: false,
        pdfWatermark: true, // "Powered by Luminel"
    },

    pro: {
        maxClients: 250,
        maxSessionsPerMonth: 500,
        maxResources: 100,
        maxTeamMembers: 5,
        maxLocations: 1,

        canGeneratePDF: true,
        canSendEmails: true, // 200/month
        canUseWhatsApp: true,
        canUseCalendarSync: true,
        canUseAnalytics: 'advanced',
        canWhiteLabel: false,
        canUseAPI: false,

        showUpgradeBanner: false,
        pdfWatermark: false, // Branded PDFs
    },

    signature: {
        maxClients: 500,
        maxSessionsPerMonth: -1, // Unlimited
        maxResources: 500,
        maxTeamMembers: 10,
        maxLocations: 2,

        canGeneratePDF: true,
        canSendEmails: true, // 1000/month
        canUseWhatsApp: true,
        canUseCalendarSync: true,
        canUseAnalytics: 'advanced',
        canWhiteLabel: true, // Logo only
        canUseAPI: false,

        showUpgradeBanner: false,
        pdfWatermark: false,
    },

    empire: {
        maxClients: -1, // Unlimited
        maxSessionsPerMonth: -1,
        maxResources: -1,
        maxTeamMembers: -1,
        maxLocations: -1,

        canGeneratePDF: true,
        canSendEmails: true, // Unlimited
        canUseWhatsApp: true,
        canUseCalendarSync: true,
        canUseAnalytics: 'executive',
        canWhiteLabel: true, // Full white-label
        canUseAPI: true,

        showUpgradeBanner: false,
        pdfWatermark: false,
    },
};

// Helper to check if a limit is reached
export const isLimitReached = (
    tier: SubscriptionTier,
    resource: 'clients' | 'sessions' | 'resources' | 'team' | 'locations',
    currentCount: number
): boolean => {
    const limits = TIER_LIMITS[tier];

    switch (resource) {
        case 'clients':
            return limits.maxClients !== -1 && currentCount >= limits.maxClients;
        case 'sessions':
            return limits.maxSessionsPerMonth !== -1 && currentCount >= limits.maxSessionsPerMonth;
        case 'resources':
            return limits.maxResources !== -1 && currentCount >= limits.maxResources;
        case 'team':
            return limits.maxTeamMembers !== -1 && currentCount >= limits.maxTeamMembers;
        case 'locations':
            return limits.maxLocations !== -1 && currentCount >= limits.maxLocations;
        default:
            return false;
    }
};

// Helper to get remaining quota
export const getRemainingQuota = (
    tier: SubscriptionTier,
    resource: 'clients' | 'sessions' | 'resources' | 'team' | 'locations',
    currentCount: number
): number | 'unlimited' => {
    const limits = TIER_LIMITS[tier];

    const limitMap = {
        clients: limits.maxClients,
        sessions: limits.maxSessionsPerMonth,
        resources: limits.maxResources,
        team: limits.maxTeamMembers,
        locations: limits.maxLocations,
    };

    const limit = limitMap[resource];
    if (limit === -1) return 'unlimited';
    return Math.max(0, limit - currentCount);
};

// Get tier display info for UI
export const getTierDisplayInfo = (tier: SubscriptionTier) => {
    const info = {
        free: { name: 'Free', color: 'stone', icon: '🆓' },
        starter: { name: 'Starter', color: 'stone', icon: '⭐' },
        pro: { name: 'Pro', color: 'amber', icon: '⚡' },
        signature: { name: 'Signature', color: 'orange', icon: '👑' },
        empire: { name: 'Empire', color: 'violet', icon: '🏛️' },
    };
    return info[tier];
};
