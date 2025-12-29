import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Crown,
    Users,
    CreditCard,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    Mail,
    RefreshCw,
    Eye,
    Shield,
    Zap,
    DollarSign,
    UserPlus,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface PendingSubscription {
    id: string;
    email: string;
    stripe_customer_id: string;
    stripe_subscription_id: string;
    plan_tier: string;
    founder_number: number | null;
    created_at: string;
    status: string;
}

interface UserStats {
    total: number;
    byTier: Record<string, number>;
    foundingMembers: number;
    thisMonth: number;
}

interface RevenueStats {
    mrr: number;
    totalRevenue: number;
    thisMonth: number;
    byTier: Record<string, number>;
}

export const AdminDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [pendingSubscriptions, setPendingSubscriptions] = useState<PendingSubscription[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [userStats, setUserStats] = useState<UserStats>({
        total: 0,
        byTier: {},
        foundingMembers: 0,
        thisMonth: 0
    });
    const [revenueStats, setRevenueStats] = useState<RevenueStats>({
        mrr: 0,
        totalRevenue: 0,
        thisMonth: 0,
        byTier: {}
    });
    const [founderSpots, setFounderSpots] = useState({ total: 100, taken: 0 });

    // Tier pricing for MRR calculation
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
                loadUsers(),
                loadFounderSpots()
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

                // Calculate MRR
                if (tierPricing[tier]) {
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
                totalRevenue: mrr * 12, // Annualized
                thisMonth: mrr,
                byTier: Object.fromEntries(
                    Object.entries(byTier).map(([tier, count]) => [
                        tier,
                        (tierPricing[tier] || 0) * count
                    ])
                )
            });
        }
    };

    const loadFounderSpots = async () => {
        const { data, error } = await supabase
            .from('founder_spots')
            .select('*')
            .single();

        if (!error && data) {
            setFounderSpots({
                total: data.total_spots || 100,
                taken: data.spots_taken || 0
            });
        }
    };

    const sendReminderEmail = async (email: string) => {
        // Call your send-email edge function
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
                        registrationUrl: `https://luminel-manager.vercel.app/#/register?email=${encodeURIComponent(email)}`
                    }
                })
            });

            if (response.ok) {
                alert(`Email reminder inviata a ${email}`);
            }
        } catch (error) {
            console.error('Error sending reminder:', error);
            alert('Errore nell\'invio dell\'email');
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

    const getTierColor = (tier: string) => {
        switch (tier?.toLowerCase()) {
            case 'empire': return 'bg-amber-500 text-white';
            case 'signature': return 'bg-purple-500 text-white';
            case 'pro': return 'bg-blue-500 text-white';
            case 'starter': return 'bg-green-500 text-white';
            default: return 'bg-stone-200 text-stone-700';
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Crown className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-stone-900 flex items-center gap-2">
                            GOD Mode <Shield className="w-6 h-6 text-amber-500" />
                        </h1>
                        <p className="text-stone-500">Pannello di controllo amministratore</p>
                    </div>
                </div>
                <button
                    onClick={loadAllData}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-700 font-medium transition-all"
                >
                    <RefreshCw className="w-4 h-4" />
                    Aggiorna
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* MRR */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-green-500/30"
                >
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign className="w-8 h-8 opacity-80" />
                        <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">MRR</span>
                    </div>
                    <p className="text-4xl font-bold">€{revenueStats.mrr.toLocaleString()}</p>
                    <p className="text-green-100 text-sm mt-1">Ricavo Mensile Ricorrente</p>
                </motion.div>

                {/* Total Users */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-500/30"
                >
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-8 h-8 opacity-80" />
                        <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">+{userStats.thisMonth} questo mese</span>
                    </div>
                    <p className="text-4xl font-bold">{userStats.total}</p>
                    <p className="text-blue-100 text-sm mt-1">Utenti Totali</p>
                </motion.div>

                {/* Founding Members */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg shadow-amber-500/30"
                >
                    <div className="flex items-center justify-between mb-4">
                        <Zap className="w-8 h-8 opacity-80" />
                        <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">{founderSpots.taken}/{founderSpots.total}</span>
                    </div>
                    <p className="text-4xl font-bold">{userStats.foundingMembers}</p>
                    <p className="text-amber-100 text-sm mt-1">Founding Members</p>
                </motion.div>

                {/* Pending */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-500 to-violet-600 p-6 rounded-2xl text-white shadow-lg shadow-purple-500/30"
                >
                    <div className="flex items-center justify-between mb-4">
                        <Clock className="w-8 h-8 opacity-80" />
                        {pendingSubscriptions.length > 0 && (
                            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full animate-pulse">
                                Azione richiesta
                            </span>
                        )}
                    </div>
                    <p className="text-4xl font-bold">{pendingSubscriptions.length}</p>
                    <p className="text-purple-100 text-sm mt-1">In Attesa Registrazione</p>
                </motion.div>
            </div>

            {/* Revenue by Tier */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <h2 className="text-xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Revenue per Piano
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(tierPricing).map(([tier, price]) => {
                        const count = userStats.byTier[tier] || 0;
                        const revenue = count * price;
                        return (
                            <div key={tier} className="p-4 bg-stone-50 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${getTierColor(tier)}`}>
                                        {tier.toUpperCase()}
                                    </span>
                                    <span className="text-stone-500 text-sm">{count} utenti</span>
                                </div>
                                <p className="text-2xl font-bold text-stone-900">€{revenue.toLocaleString()}</p>
                                <p className="text-xs text-stone-400">€{price}/mese × {count}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pending Subscriptions Table */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <h2 className="text-xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    Subscriptions in Attesa ({pendingSubscriptions.length})
                </h2>

                {pendingSubscriptions.length === 0 ? (
                    <div className="text-center py-8 text-stone-400">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nessuna subscription in attesa</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-stone-100">
                                    <th className="text-left py-3 px-4 text-stone-500 font-medium">Email</th>
                                    <th className="text-left py-3 px-4 text-stone-500 font-medium">Piano</th>
                                    <th className="text-left py-3 px-4 text-stone-500 font-medium">Founder #</th>
                                    <th className="text-left py-3 px-4 text-stone-500 font-medium">Data</th>
                                    <th className="text-left py-3 px-4 text-stone-500 font-medium">Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingSubscriptions.map((sub) => (
                                    <tr key={sub.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-stone-900">{sub.email}</td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${getTierColor(sub.plan_tier)}`}>
                                                {sub.plan_tier?.toUpperCase() || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {sub.founder_number ? (
                                                <span className="text-amber-600 font-bold">#{sub.founder_number}</span>
                                            ) : (
                                                <span className="text-stone-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-stone-500">{formatDate(sub.created_at)}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => sendReminderEmail(sub.email)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Invia reminder email"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deletePendingSubscription(sub.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Elimina"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <h2 className="text-xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-500" />
                    Ultimi Utenti Registrati
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-stone-100">
                                <th className="text-left py-3 px-4 text-stone-500 font-medium">Nome</th>
                                <th className="text-left py-3 px-4 text-stone-500 font-medium">Email</th>
                                <th className="text-left py-3 px-4 text-stone-500 font-medium">Piano</th>
                                <th className="text-left py-3 px-4 text-stone-500 font-medium">Founder</th>
                                <th className="text-left py-3 px-4 text-stone-500 font-medium">Registrato</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.slice(0, 10).map((user) => (
                                <tr key={user.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                                    <td className="py-3 px-4 font-medium text-stone-900">{user.full_name || '-'}</td>
                                    <td className="py-3 px-4 text-stone-600">{user.email}</td>
                                    <td className="py-3 px-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getTierColor(user.subscription_tier)}`}>
                                            {user.subscription_tier?.toUpperCase() || 'FREE'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {user.is_founding_member ? (
                                            <span className="flex items-center gap-1 text-amber-600">
                                                <Crown className="w-4 h-4" />
                                                #{user.founding_member_number}
                                            </span>
                                        ) : (
                                            <span className="text-stone-400">-</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-stone-500">{formatDate(user.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Founder Spots Progress */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        Posti Founder Disponibili
                    </h2>
                    <span className="text-2xl font-bold text-amber-600">
                        {founderSpots.total - founderSpots.taken} / {founderSpots.total}
                    </span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-4 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-500"
                        style={{ width: `${(founderSpots.taken / founderSpots.total) * 100}%` }}
                    />
                </div>
                <p className="text-sm text-amber-700 mt-2">
                    {founderSpots.taken} posti assegnati • {founderSpots.total - founderSpots.taken} disponibili
                </p>
            </div>
        </div>
    );
};

export default AdminDashboard;
