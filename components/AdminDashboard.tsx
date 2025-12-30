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

    const getTierBadge = (tier: string) => {
        switch (tier?.toLowerCase()) {
            case 'empire':
                return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-900';
            case 'signature':
                return 'bg-gradient-to-r from-stone-300 to-stone-400 text-stone-900';
            case 'pro':
                return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
            case 'starter':
                return 'bg-gradient-to-r from-stone-500 to-stone-600 text-white';
            default:
                return 'bg-stone-700 text-stone-300';
        }
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

    const founderSpotsTaken = userStats.foundingMembers + pendingSubscriptions.filter(p => p.is_founding_member).length;
    const founderSpotsTotal = 100;
    const founderSpotsRemaining = founderSpotsTotal - founderSpotsTaken;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
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
                            className="w-16 h-16 bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-400/20"
                        >
                            <Crown className="w-8 h-8 text-stone-800" />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-stone-100 flex items-center gap-3">
                                GOD Mode
                                <Shield className="w-7 h-7 text-amber-400" />
                            </h1>
                            <p className="text-stone-500 mt-1">Pannello di controllo imperiale</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={loadAllData}
                        className="flex items-center gap-2 px-5 py-3 bg-stone-800/80 hover:bg-stone-700/80 border border-amber-500/20 rounded-xl text-amber-200 font-medium transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Aggiorna
                    </motion.button>
                </div>

                {/* Stats Overview - Champagne/Gold Palette */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* MRR */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden bg-gradient-to-br from-stone-800/80 to-stone-900/80 p-6 rounded-2xl border border-amber-500/20 shadow-xl"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full -mr-12 -mt-12" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-300 to-amber-500 rounded-xl flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-stone-900" />
                                </div>
                                <span className="text-xs font-bold bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full">MRR</span>
                            </div>
                            <p className="text-4xl font-bold text-amber-100">€{revenueStats.mrr.toLocaleString()}</p>
                            <p className="text-stone-500 text-sm mt-2">Ricavo Mensile Ricorrente</p>
                        </div>
                    </motion.div>

                    {/* Total Users */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative overflow-hidden bg-gradient-to-br from-stone-800/80 to-stone-900/80 p-6 rounded-2xl border border-stone-700/50 shadow-xl"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-stone-600/5 rounded-full -mr-12 -mt-12" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-stone-400 to-stone-600 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-stone-100" />
                                </div>
                                {userStats.thisMonth > 0 && (
                                    <span className="text-xs font-bold bg-stone-600/30 text-stone-300 px-3 py-1 rounded-full">
                                        +{userStats.thisMonth} questo mese
                                    </span>
                                )}
                            </div>
                            <p className="text-4xl font-bold text-stone-100">{userStats.total}</p>
                            <p className="text-stone-500 text-sm mt-2">Utenti Totali</p>
                        </div>
                    </motion.div>

                    {/* Founding Members */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative overflow-hidden bg-gradient-to-br from-amber-900/30 to-stone-900/80 p-6 rounded-2xl border border-amber-600/30 shadow-xl"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-12 -mt-12" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                                    <Crown className="w-6 h-6 text-stone-900" />
                                </div>
                                <span className="text-xs font-bold bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full">
                                    {founderSpotsTaken}/{founderSpotsTotal}
                                </span>
                            </div>
                            <p className="text-4xl font-bold text-amber-200">{userStats.foundingMembers}</p>
                            <p className="text-stone-500 text-sm mt-2">Founding Members</p>
                        </div>
                    </motion.div>

                    {/* Pending */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative overflow-hidden bg-gradient-to-br from-stone-800/80 to-stone-900/80 p-6 rounded-2xl border border-stone-700/50 shadow-xl"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-stone-600/5 rounded-full -mr-12 -mt-12" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-stone-500 to-stone-700 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-stone-200" />
                                </div>
                                {pendingSubscriptions.length > 0 && (
                                    <span className="text-xs font-bold bg-amber-500/30 text-amber-300 px-3 py-1 rounded-full animate-pulse">
                                        Azione richiesta
                                    </span>
                                )}
                            </div>
                            <p className="text-4xl font-bold text-stone-100">{pendingSubscriptions.length}</p>
                            <p className="text-stone-500 text-sm mt-2">In Attesa Registrazione</p>
                        </div>
                    </motion.div>
                </div>

                {/* Revenue by Tier */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-stone-900/60 backdrop-blur-xl rounded-2xl border border-stone-800/80 p-6 shadow-xl"
                >
                    <h2 className="text-xl font-serif font-bold text-stone-100 mb-6 flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-amber-400" />
                        Revenue per Piano
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(tierPricing).map(([tier, price]) => {
                            const count = userStats.byTier[tier] || 0;
                            const revenue = count * price;
                            return (
                                <div key={tier} className="p-5 bg-stone-800/50 rounded-xl border border-stone-700/30 hover:border-amber-500/30 transition-all group">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getTierBadge(tier)}`}>
                                            {tier.toUpperCase()}
                                        </span>
                                        <span className="text-stone-500 text-sm">{count} utenti</span>
                                    </div>
                                    <p className="text-3xl font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
                                        €{revenue.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-stone-600 mt-1">€{price}/mese × {count}</p>
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
                    className="bg-stone-900/60 backdrop-blur-xl rounded-2xl border border-stone-800/80 p-6 shadow-xl"
                >
                    <h2 className="text-xl font-serif font-bold text-stone-100 mb-6 flex items-center gap-3">
                        <Activity className="w-5 h-5 text-amber-400" />
                        Subscriptions in Attesa
                        {pendingSubscriptions.length > 0 && (
                            <span className="bg-amber-500/20 text-amber-400 text-sm px-3 py-1 rounded-full">
                                {pendingSubscriptions.length}
                            </span>
                        )}
                    </h2>

                    {pendingSubscriptions.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-stone-700" />
                            <p className="text-stone-400 text-lg">Nessuna subscription in attesa</p>
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
                                            <td className="py-4 px-4 font-medium text-stone-200">{sub.email}</td>
                                            <td className="py-4 px-4">
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getTierBadge(sub.subscription_tier)}`}>
                                                    {sub.subscription_tier?.toUpperCase() || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-stone-400">
                                                {sub.billing_cycle === 'yearly' ? 'Annuale' : 'Mensile'}
                                            </td>
                                            <td className="py-4 px-4">
                                                {sub.founding_member_number ? (
                                                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                                                        <Crown className="w-4 h-4" />
                                                        #{sub.founding_member_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-600">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-stone-500">{formatDate(sub.created_at)}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => sendReminderEmail(sub.email, sub.subscription_tier)}
                                                        className="p-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors"
                                                        title="Invia reminder email"
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => deletePendingSubscription(sub.id)}
                                                        className="p-2 bg-stone-700/50 text-stone-400 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
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
                    className="bg-stone-900/60 backdrop-blur-xl rounded-2xl border border-stone-800/80 p-6 shadow-xl"
                >
                    <h2 className="text-xl font-serif font-bold text-stone-100 mb-6 flex items-center gap-3">
                        <UserPlus className="w-5 h-5 text-amber-400" />
                        Ultimi Utenti Registrati
                    </h2>

                    {users.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 mx-auto mb-4 text-stone-700" />
                            <p className="text-stone-400 text-lg">Nessun utente registrato</p>
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
                                            <td className="py-4 px-4 font-medium text-stone-200">{user.full_name || '-'}</td>
                                            <td className="py-4 px-4 text-stone-400">{user.email}</td>
                                            <td className="py-4 px-4">
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getTierBadge(user.subscription_tier)}`}>
                                                    {user.subscription_tier?.toUpperCase() || 'FREE'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                {user.is_founding_member ? (
                                                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                                                        <Crown className="w-4 h-4" />
                                                        #{user.founding_member_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-600">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-stone-500">{formatDate(user.created_at)}</td>
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
                    className="bg-gradient-to-r from-stone-900/80 to-stone-900/60 rounded-2xl border border-amber-500/20 p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-serif font-bold text-stone-100 flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            Posti Founder Disponibili
                        </h2>
                        <span className="text-2xl font-bold text-amber-300">
                            {founderSpotsRemaining} / {founderSpotsTotal}
                        </span>
                    </div>
                    <div className="w-full bg-stone-800 rounded-full h-3 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(founderSpotsTaken / founderSpotsTotal) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 h-full"
                        />
                    </div>
                    <p className="text-sm text-stone-500 mt-3">
                        {founderSpotsTaken} posti assegnati • {founderSpotsRemaining} ancora disponibili
                    </p>
                </motion.div>

                {/* Footer */}
                <div className="text-center pt-8 border-t border-stone-800/50">
                    <p className="text-stone-700 text-sm tracking-widest">
                        LUMINEL MANAGER · GOD MODE · PRESTIGE & EXCELLENCE
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
