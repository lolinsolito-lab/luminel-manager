import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';

interface FoundingMemberBadgeProps {
    since?: string; // ISO date string
    size?: 'sm' | 'md' | 'lg';
    showTooltip?: boolean;
}

export const FoundingMemberBadge: React.FC<FoundingMemberBadgeProps> = ({
    since,
    size = 'md',
    showTooltip = true
}) => {
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs gap-1',
        md: 'px-3 py-1 text-sm gap-1.5',
        lg: 'px-4 py-1.5 text-base gap-2'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('it-IT', {
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="relative group inline-flex"
        >
            <div className={`
        inline-flex items-center ${sizeClasses[size]}
        bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500
        text-amber-900 font-semibold rounded-full
        shadow-lg shadow-amber-400/30
        border border-amber-300/50
      `}>
                <Crown className={iconSizes[size]} />
                <span>Founding Member</span>
                <Sparkles className={`${iconSizes[size]} opacity-70`} />
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full blur-lg opacity-30 -z-10" />

            {/* Tooltip */}
            {showTooltip && since && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-stone-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
                        Membro dal {formatDate(since)}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-800" />
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// Tier-specific badges
interface TierBadgeProps {
    tier: 'starter' | 'pro' | 'signature' | 'empire';
    size?: 'sm' | 'md';
}

export const SubscriptionTierBadge: React.FC<TierBadgeProps> = ({ tier, size = 'md' }) => {
    const tierConfig = {
        starter: {
            label: 'Starter',
            gradient: 'from-stone-400 to-stone-500',
            icon: '⭐'
        },
        pro: {
            label: 'Pro',
            gradient: 'from-amber-500 to-yellow-500',
            icon: '⚡'
        },
        signature: {
            label: 'Signature',
            gradient: 'from-orange-500 to-red-500',
            icon: '🔥'
        },
        empire: {
            label: 'Empire',
            gradient: 'from-violet-500 to-purple-600',
            icon: '👑'
        }
    };

    const config = tierConfig[tier];
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

    return (
        <div className={`
      inline-flex items-center gap-1 ${sizeClasses}
      bg-gradient-to-r ${config.gradient}
      text-white font-semibold rounded-full
      shadow-md
    `}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </div>
    );
};

export default FoundingMemberBadge;
