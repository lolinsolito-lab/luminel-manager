import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Crown,
    Users,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    Mail,
    RefreshCw,
    Shield,
    Zap,
    DollarSign,
    UserPlus,
    Loader2,
    Sparkles,
    Activity
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface PendingSubscription {
    id: string;
    email: string;
    stripe_customer_id: string;
    stripe_subscription_id: string;
    subscription_tier: string;
    billing_cycle: string;
    is_founding_member: boolean;
    founding_member_number: number | null;
    created_at: string;
    status: string;
}

interface UserData {
    id: string;
    email: string;
    full_name: string | null;
    subscription_tier: string;
    subscription_status: string;
    is_founding_member: boolean;
    founding_member_number: number | null;
    created_at: string;
}

interface UserStats {
    total: number;
    byTier: Record<string, number>;
    foundingMembers: number;
    thisMonth: number;
}

interface RevenueStats {
    mrr: number;
    byTier: Record<string, number>;
}

export const AdminDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [pendingSubscriptions, setPendingSubscriptions] = useState<PendingSubscription[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [userStats, setUserStats] = useState<UserStats>({
        total: 0,
        byTier: {},
        foundingMembers: 0,
        thisMonth: 0
    });
    const [revenueStats, setRevenueStats] = useState<RevenueStats>({
        mrr: 0,
        byTier: {}
    });

    // Tier pricing for MRR calculation (monthly prices)
    const tierPricing: Record<string, number> = {
        'starter': 29,
        'pro': 79,
        'signature': 149,
        'empire': 299
    };

    const tierColors: Record<string, { bg: string; text: string; glow: string }> = {
        'starter': { bg: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-emerald-500/30' },
        'pro': { bg: 'bg-blue-500', text: 'text-blue-400', glow: 'shadow-blue-500/30' },
        'signature': { bg: 'bg-purple-500', text: 'text-purple-400', glow: 'shadow-purple-500/30' },
        'empire': { bg: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/30' },
        'free': { bg: 'bg-stone-600', text: 'text-stone-400', glow: 'shadow-stone-500/30' }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                loadPendingSubscriptions(),
                loadUsers()
            ]);
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
        setIsLoading(false);
    };

    const loadPendingSubscriptions = async () => {
        const { data, error } = await supabase
            .from('pending_subscriptions')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setPendingSubscriptions(data);
        }
    };

    const loadUsers = async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setUsers(data);

            // Calculate stats
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const byTier: Record<string, number> = {};
            let foundingMembers = 0;
            let thisMonth = 0;
            let mrr = 0;

            data.forEach(user => {
                const tier = user.subscription_tier || 'free';
                byTier[tier] = (byTier[tier] || 0) + 1;

                if (user.is_founding_member) foundingMembers++;
                if (new Date(user.created_at) >= startOfMonth) thisMonth++;

                // Calculate MRR only for active paid tiers
                if (tierPricing[tier] && user.subscription_status === 'active') {
                    mrr += tierPricing[tier];
                }
            });

            setUserStats({
                total: data.length,
                byTier,
                foundingMembers,
                thisMonth
            });

            setRevenueStats({
                mrr,
                byTier: Object.fromEntries(
                    Object.entries(byTier).map(([tier, count]) => [
                        tier,
                        (tierPricing[tier] || 0) * count
                    ])
                )
            });
        }
    };

    const sendReminderEmail = async (email: string, tier: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    to: email,
                    type: 'invite_registration',
                    data: {
                        tier: tier,
                        registrationUrl: `https://luminel-manager.vercel.app/#/register?email=${encodeURIComponent(email)}`
                    }
                })
            });

            if (response.ok) {
                alert(`✅ Email reminder inviata a ${email}`);
            } else {
                alert('❌ Errore nell\'invio dell\'email');
            }
        } catch (error) {
            console.error('Error sending reminder:', error);
            alert('❌ Errore nell\'invio dell\'email');
        }
    };

    const deletePendingSubscription = async (id: string) => {
        if (!confirm('Sei sicuro di voler eliminare questa subscription pending?')) return;

        const { error } = await supabase
            .from('pending_subscriptions')
            .delete()
            .eq('id', id);

        if (!error) {
            setPendingSubscriptions(prev => prev.filter(p => p.id !== id));
        }
    };

    const getTierBadgeClass = (tier: string) => {
        const colors = tierColors[tier?.toLowerCase()] || tierColors['free'];
        return `${colors.bg} text-white`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate founder spots (100 total - founding members)
    const founderSpotsTaken = userStats.foundingMembers + pendingSubscriptions.filter(p => p.is_founding_member).length;
    const founderSpotsTotal = 100;
    const founderSpotsRemaining = founderSpotsTotal - founderSpotsTaken;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
                    <p className="text-stone-400 font-medium">Caricamento GOD Mode...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 p-6 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/40"
                        >
                            <Crown className="w-8 h-8 text-stone-900" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white flex items-center gap-3">
                                GOD Mode
                                <Shield className="w-7 h-7 text-amber-500" />
                            </h1>
                            <p className="text-stone-500 mt-1">Pannello di controllo imperiale</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={loadAllData}
                        className="flex items-center gap-2 px-5 py-3 bg-stone-800/50 hover:bg-stone-800 border border-stone-700/50 rounded-xl text-stone-300 font-medium transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Aggiorna
                    </motion.button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* MRR */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl shadow-2xl shadow-emerald-500/20"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full text-white">MRR</span>
                            </div>
                            <p className="text-4xl font-bold text-white">€{revenueStats.mrr.toLocaleString()}</p>
                            <p className="text-emerald-200 text-sm mt-2">Ricavo Mensile Ricorrente</p>
                        </div>
                    </motion.div>

                    {/* Total Users */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-800 p-6 rounded-2xl shadow-2xl shadow-blue-500/20"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                {userStats.thisMonth > 0 && (
                                    <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full text-white animate-pulse">
                                        +{userStats.thisMonth} questo mese
                                    </span>
                                )}
                            </div>
                            <p className="text-4xl font-bold text-white">{userStats.total}</p>
                            <p className="text-blue-200 text-sm mt-2">Utenti Totali</p>
                        </div>
                    </motion.div>

                    {/* Founding Members */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-700 p-6 rounded-2xl shadow-2xl shadow-amber-500/20"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full text-white">
                                    {founderSpotsTaken}/{founderSpotsTotal}
                                </span>
                            </div>
                            <p className="text-4xl font-bold text-white">{userStats.foundingMembers}</p>
                            <p className="text-amber-200 text-sm mt-2">Founding Members</p>
                        </div>
                    </motion.div>

                    {/* Pending */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-violet-800 p-6 rounded-2xl shadow-2xl shadow-purple-500/20"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                {pendingSubscriptions.length > 0 && (
                                    <span className="text-xs font-bold bg-red-500 px-3 py-1 rounded-full text-white animate-pulse">
                                        Azione richiesta
                                    </span>
                                )}
                            </div>
                            <p className="text-4xl font-bold text-white">{pendingSubscriptions.length}</p>
                            <p className="text-purple-200 text-sm mt-2">In Attesa Registrazione</p>
                        </div>
                    </motion.div>
                </div>

                {/* Revenue by Tier */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-stone-900/50 backdrop-blur-xl rounded-2xl border border-stone-800/50 p-6 shadow-xl"
                >
                    <h2 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        Revenue per Piano
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(tierPricing).map(([tier, price]) => {
                            const count = userStats.byTier[tier] || 0;
                            const revenue = count * price;
                            const colors = tierColors[tier];
                            return (
                                <div key={tier} className="p-5 bg-stone-800/50 rounded-xl border border-stone-700/30 hover:border-stone-600/50 transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getTierBadgeClass(tier)}`}>
                                            {tier.toUpperCase()}
                                        </span>
                                        <span className="text-stone-500 text-sm">{count} utenti</span>
                                    </div>
                                    <p className={`text-3xl font-bold ${colors?.text || 'text-white'}`}>€{revenue.toLocaleString()}</p>
                                    <p className="text-xs text-stone-500 mt-1">€{price}/mese × {count}</p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Pending Subscriptions Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-stone-900/50 backdrop-blur-xl rounded-2xl border border-stone-800/50 p-6 shadow-xl"
                >
                    <h2 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-3">
                        <Activity className="w-5 h-5 text-purple-500" />
                        Subscriptions in Attesa
                        {pendingSubscriptions.length > 0 && (
                            <span className="bg-purple-500/20 text-purple-400 text-sm px-3 py-1 rounded-full">
                                {pendingSubscriptions.length}
                            </span>
                        )}
                    </h2>

                    {pendingSubscriptions.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-stone-700" />
                            <p className="text-stone-500 text-lg">Nessuna subscription in attesa</p>
                            <p className="text-stone-600 text-sm mt-1">Tutti gli utenti hanno completato la registrazione</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-stone-800">
                                        <th className="text-left py-4 px-4 text-stone-500 font-medium">Email</th>
                                        <th className="text-left py-4 px-4 text-stone-500 font-medium">Piano</th>
                                        <th className="text-left py-4 px-4 text-stone-500 font-medium">Ciclo</th>
                                        <th className="text-left py-4 px-4 text-stone-500 font-medium">Founder #</th>
                                        <th className="text-left py-4 px-4 text-stone-500 font-medium">Data</th>
                                        <th className="text-left py-4 px-4 text-stone-500 font-medium">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingSubscriptions.map((sub) => (
                                        <tr key={sub.id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                                            <td className="py-4 px-4 font-medium text-white">{sub.email}</td>
                                            <td className="py-4 px-4">
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getTierBadgeClass(sub.subscription_tier)}`}>
                                                    {sub.subscription_tier?.toUpperCase() || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-stone-400">
                                                {sub.billing_cycle === 'yearly' ? 'Annuale' : 'Mensile'}
                                            </td>
                                            <td className="py-4 px-4">
                                                {sub.founding_member_number ? (
                                                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                                                        <Crown className="w-4 h-4" />
                                                        #{sub.founding_member_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-600">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-stone-400">{formatDate(sub.created_at)}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => sendReminderEmail(sub.email, sub.subscription_tier)}
                                                        className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"
                                                        title="Invia reminder email"
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => deletePendingSubscription(sub.id)}
                                                        className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                                                        title="Elimina"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

                {/* Recent Users */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-stone-900/50 backdrop-blur-xl rounded-2xl border border-stone-800/50 p-6 shadow-xl"
                >
                    <h2 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-3">
                        <UserPlus className="w-5 h-5 text-blue-500" />
                        Ultimi Utenti Registrati
                    </h2>

                    {users.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 mx-auto mb-4 text-stone-700" />
                            <p className="text-stone-500 text-lg">Nessun utente registrato</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-stone-800">
                                        <th className="text-left py-4 px-4 text-stone-500 font-medium">Nome</th>
                                        <th className="text-left py-4 px-4 text-stone-500 font-medium">Email</th>
                                        <th className="text-left py-4 px-4 text-stone-500 font-medium">Piano</th>
                                        <th className="text-left py-4 px-4 text-stone-500 font-medium">Founder</th>
                                        <th className="text-left py-4 px-4 text-stone-500 font-medium">Registrato</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.slice(0, 10).map((user) => (
                                        <tr key={user.id} className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors">
                                            <td className="py-4 px-4 font-medium text-white">{user.full_name || '-'}</td>
                                            <td className="py-4 px-4 text-stone-400">{user.email}</td>
                                            <td className="py-4 px-4">
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getTierBadgeClass(user.subscription_tier)}`}>
                                                    {user.subscription_tier?.toUpperCase() || 'FREE'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                {user.is_founding_member ? (
                                                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                                                        <Crown className="w-4 h-4" />
                                                        #{user.founding_member_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-600">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-stone-400">{formatDate(user.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

                {/* Founder Spots Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-2xl border border-amber-700/30 p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-serif font-bold text-white flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            Posti Founder Disponibili
                        </h2>
                        <span className="text-2xl font-bold text-amber-500">
                            {founderSpotsRemaining} / {founderSpotsTotal}
                        </span>
                    </div>
                    <div className="w-full bg-stone-800 rounded-full h-4 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(founderSpotsTaken / founderSpotsTotal) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 h-full"
                        />
                    </div>
                    <p className="text-sm text-amber-300/70 mt-3">
                        {founderSpotsTaken} posti assegnati • {founderSpotsRemaining} ancora disponibili
                    </p>
                </motion.div>

                {/* Footer */}
                <div className="text-center pt-8 border-t border-stone-800">
                    <p className="text-stone-600 text-sm">
                        LUMINEL MANAGER · GOD MODE · PRESTIGE & EXCELLENCE
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
