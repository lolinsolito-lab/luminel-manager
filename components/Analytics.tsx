
import React, { useState, useEffect, useMemo } from 'react';
import {
   BarChart3,
   TrendingUp,
   Users,
   Target,
   Calendar,
   ArrowUpRight,
   ArrowDownRight,
   PieChart as PieIcon,
   Download,
   Euro,
   Loader2,
   Crown,
   Sparkles,
   Rocket
} from 'lucide-react';
import {
   AreaChart,
   Area,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   PieChart,
   Pie,
   Cell,
   BarChart,
   Bar,
   Legend
} from 'recharts';
import { isSupabaseConfigured } from '../services/supabaseClient';
import * as transactionService from '../services/transactionService';
import * as sessionService from '../services/sessionService';
import * as clientService from '../services/clientService';
import { useSubscription } from '../contexts/SubscriptionContext';

// Types for real data
interface RevenueDataPoint {
   month: string;
   revenue: number;
   expenses: number;
}

interface ProgramDistribution {
   name: string;
   value: number;
   color: string;
}

// === LUMINA ROYAL PALETTE ===
// Semantically meaningful colors for financial data
const LUMINA_COLORS = {
   // Income/Revenue: Oro Champagne Luminoso
   income: '#D4A853',  // Gold Royal
   incomeLight: 'hsla(43, 65%, 58%, 0.3)',

   // Expenses: Rosa Champagne elegante (non rosso aggressivo)
   expense: '#C9A18C',  // Rose Champagne
   expenseLight: 'hsla(20, 35%, 67%, 0.3)',

   // Payroll: Blu Navy Royal
   payroll: '#5B7C99',  // Navy Royal
   payrollLight: 'hsla(207, 25%, 48%, 0.3)',

   // Success/VIP: Sage Lusso
   success: '#8FAE8B',  // Sage Green
   successLight: 'hsla(115, 18%, 61%, 0.2)',

   // Warning/At Risk: Ambra Champagne
   warning: '#D4A574',  // Amber Champagne
   warningLight: 'hsla(30, 50%, 64%, 0.2)',

   // Neutral/New: Pearl Gray
   neutral: '#A8A095',  // Pearl Gray
   neutralLight: 'hsla(40, 8%, 62%, 0.2)',

   // VIP Special: Oro Intenso
   vip: '#C4956A',  // Deep Gold
};

// Colors for pie chart (order: Income categories)
const PROGRAM_COLORS = [
   LUMINA_COLORS.income,    // Primary income - Oro
   LUMINA_COLORS.success,   // Secondary - Sage  
   LUMINA_COLORS.payroll,   // Tertiary - Navy
   LUMINA_COLORS.neutral,   // Quaternary - Pearl
   LUMINA_COLORS.warning,   // Quinary - Amber
];

const KpiCard = ({ title, value, subtext, trend, trendLabel, icon: Icon, colorClass, isLoading }: any) => (
   <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
         <div className={`p-3 rounded-xl transition-colors duration-300 ${colorClass}`}>
            <Icon className="w-6 h-6 text-white" />
         </div>
         {trend !== undefined && trend !== null && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full border flex items-center gap-1 transition-colors`}
               style={{
                  backgroundColor: trend >= 0 ? `${LUMINA_COLORS.success}15` : `${LUMINA_COLORS.expense}15`,
                  color: trend >= 0 ? LUMINA_COLORS.success : LUMINA_COLORS.expense,
                  borderColor: trend >= 0 ? `${LUMINA_COLORS.success}30` : `${LUMINA_COLORS.expense}30`
               }}
            >
               {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
               {Math.abs(trend)}%
            </span>
         )}
      </div>
      <div>
         <h3 className="text-stone-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
         {isLoading ? (
            <div className="h-9 w-24 bg-stone-100 rounded animate-pulse mt-1" />
         ) : (
            <p className="text-3xl font-serif font-bold text-stone-900 mt-1">{value}</p>
         )}
         <p className="text-xs text-stone-400 mt-1 group-hover:text-stone-600 transition-colors">{subtext}</p>
      </div>
   </div>
);

export const Analytics: React.FC = () => {
   const [timeRange, setTimeRange] = useState('Year to Date');
   const [isLoading, setIsLoading] = useState(true);
   const { subscription } = useSubscription();

   // Real data states
   const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
   const [financeStats, setFinanceStats] = useState({
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      revenueThisMonth: 0,
      expensesThisMonth: 0,
      pendingPayments: 0
   });
   const [sessionStats, setSessionStats] = useState({
      totalToday: 0,
      totalWeek: 0,
      completedThisMonth: 0,
      cancelledThisMonth: 0
   });
   const [clientStats, setClientStats] = useState({
      totalClients: 0,
      vipClients: 0,
      atRiskClients: 0,
      newClientsThisMonth: 0
   });
   const [programDistribution, setProgramDistribution] = useState<ProgramDistribution[]>([]);

   // Retention data for bar chart (simplified view based on client stats)
   const retentionData = useMemo(() => {
      return [
         { name: 'VIP', clients: clientStats.vipClients },
         { name: 'Attivi', clients: clientStats.totalClients - clientStats.atRiskClients - clientStats.newClientsThisMonth },
         { name: 'A Rischio', clients: clientStats.atRiskClients },
         { name: 'Nuovi', clients: clientStats.newClientsThisMonth },
      ];
   }, [clientStats]);

   // Load real data from Supabase
   useEffect(() => {
      const loadAnalyticsData = async () => {
         setIsLoading(true);

         try {
            if (!isSupabaseConfigured()) {
               console.log('[Analytics] ⚠️ Supabase not configured, using empty data');
               setIsLoading(false);
               return;
            }

            // Parallel data fetching
            const [
               monthlyData,
               stats,
               sessions,
               clients,
               transactions
            ] = await Promise.all([
               transactionService.getMonthlyBreakdown(new Date().getFullYear()),
               transactionService.getFinanceStats(),
               sessionService.getSessionStats(),
               clientService.getClients(),
               transactionService.getTransactions()
            ]);

            // Process monthly revenue data
            const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
            const processedRevenueData = monthlyData.map(item => ({
               month: monthNames[item.month - 1] || `M${item.month}`,
               revenue: item.revenue,
               expenses: item.expenses
            }));
            setRevenueData(processedRevenueData);

            // Set finance stats
            setFinanceStats(stats);

            // Set session stats
            setSessionStats(sessions);

            // Calculate client stats
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const vipCount = clients.filter(c => c.isVIP).length;
            // At risk = no session in 30+ days
            const atRiskCount = clients.filter(c => {
               if (!c.lastSession) return true;
               return new Date(c.lastSession) < thirtyDaysAgo;
            }).length;
            // New clients = based on totalSessions (if 0 or 1, they're new)
            const newCount = clients.filter(c => (c.totalSessions || 0) <= 1).length;

            setClientStats({
               totalClients: clients.length,
               vipClients: vipCount,
               atRiskClients: atRiskCount,
               newClientsThisMonth: newCount
            });

            // Calculate program distribution from transactions
            const categoryTotals: Record<string, number> = {};
            transactions
               .filter(t => t.type === 'Income')
               .forEach(t => {
                  const cat = t.category || 'Altro';
                  categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
               });

            const totalIncome = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
            const distribution = Object.entries(categoryTotals)
               .map(([name, value], idx) => ({
                  name,
                  value: totalIncome > 0 ? Math.round((value / totalIncome) * 100) : 0,
                  color: PROGRAM_COLORS[idx % PROGRAM_COLORS.length]
               }))
               .sort((a, b) => b.value - a.value)
               .slice(0, 5); // Top 5 categories

            setProgramDistribution(distribution);

            console.log('[Analytics] ✅ Real data loaded successfully');
         } catch (error) {
            console.error('[Analytics] ❌ Error loading data:', error);
         }

         setIsLoading(false);
      };

      loadAnalyticsData();
   }, []);

   // Calculate trends
   const revenueTrend = useMemo(() => {
      if (revenueData.length < 2) return 0;
      const current = revenueData[revenueData.length - 1]?.revenue || 0;
      const previous = revenueData[revenueData.length - 2]?.revenue || 1;
      return Math.round(((current - previous) / previous) * 100);
   }, [revenueData]);

   const retentionRate = useMemo(() => {
      if (clientStats.totalClients === 0) return 0;
      const returning = clientStats.totalClients - clientStats.newClientsThisMonth;
      return Math.round((returning / clientStats.totalClients) * 100);
   }, [clientStats]);

   const avgSessionValue = useMemo(() => {
      const totalSessions = sessionStats.completedThisMonth || 1;
      return Math.round(financeStats.revenueThisMonth / totalSessions);
   }, [financeStats, sessionStats]);

   const isPositiveTrend = revenueTrend >= 0;
   // Royal colors for trend indicators
   const revenueColorClass = isPositiveTrend
      ? 'bg-gradient-to-br from-[#8FAE8B] to-[#6B8E68] shadow-lg shadow-[#8FAE8B]/30'
      : 'bg-gradient-to-br from-[#C9A18C] to-[#A8837A] shadow-lg shadow-[#C9A18C]/30';

   return (
      <div className="space-y-8 w-full max-w-[1600px] pb-10">

         {/* Header */}
         <div className="flex flex-col sm:flex-row justify-between items-end gap-6 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
            <div>
               <h1 className="text-3xl font-serif font-bold text-stone-900">Growth Analytics</h1>
               <p className="text-stone-500 mt-1">Visualize your impact, revenue flow, and business health.</p>
            </div>
            <div className="flex gap-3">
               <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-700 outline-none focus:border-gold-400 cursor-pointer hover:bg-stone-100 transition-colors"
               >
                  <option>Last 30 Days</option>
                  <option>This Quarter</option>
                  <option>Year to Date</option>
                  <option>All Time</option>
               </select>
               <button className="bg-stone-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-stone-700 shadow-lg shadow-stone-200 transition-all active:scale-95">
                  <Download className="w-4 h-4" /> Export Report
               </button>
            </div>
         </div>

         {/* KPI Overview */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <KpiCard
               title="Fatturato Totale (YTD)"
               value={`€${financeStats.totalRevenue.toLocaleString()}`}
               subtext={`Profitto netto: €${financeStats.netProfit.toLocaleString()}`}
               trend={revenueTrend}
               icon={Euro}
               colorClass={revenueColorClass}
               isLoading={isLoading}
            />
            <KpiCard
               title="Retention Clienti"
               value={`${retentionRate}%`}
               subtext={`${clientStats.totalClients} clienti totali`}
               trend={null}
               icon={Users}
               colorClass="bg-gold-500"
               isLoading={isLoading}
            />
            <KpiCard
               title="Valore Medio Sessione"
               value={`€${avgSessionValue.toLocaleString()}`}
               subtext={`${sessionStats.completedThisMonth} sessioni questo mese`}
               trend={null}
               icon={Target}
               colorClass="bg-stone-800"
               isLoading={isLoading}
            />
            <KpiCard
               title="Sessioni Completate"
               value={sessionStats.completedThisMonth.toString()}
               subtext={`${sessionStats.totalWeek} questa settimana`}
               trend={null}
               icon={Calendar}
               colorClass="bg-blue-600"
               isLoading={isLoading}
            />
         </div>

         {/* Main Charts Row */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Revenue Area Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm transition-all hover:shadow-md">
               <div className="flex justify-between items-center mb-6">
                  <div>
                     <h3 className="text-lg font-serif font-bold text-stone-800">Financial Flow</h3>
                     <p className="text-xs text-stone-400">Income vs Operational Costs</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-stone-500">
                     <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: LUMINA_COLORS.income }}></span> Fatturato</div>
                     <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: LUMINA_COLORS.expense }}></span> Spese</div>
                  </div>
               </div>
               <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                           <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={LUMINA_COLORS.income} stopOpacity={0.4} />
                              <stop offset="95%" stopColor={LUMINA_COLORS.income} stopOpacity={0} />
                           </linearGradient>
                           <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={LUMINA_COLORS.expense} stopOpacity={0.4} />
                              <stop offset="95%" stopColor={LUMINA_COLORS.expense} stopOpacity={0} />
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 500 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 500 }} tickFormatter={(val) => `€${val / 1000}k`} />
                        <Tooltip
                           contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                           formatter={(value: number) => [`€${value.toLocaleString()}`, '']}
                           itemStyle={{ fontWeight: 600, color: '#44403c' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke={LUMINA_COLORS.income} strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Fatturato" />
                        <Area type="monotone" dataKey="expenses" stroke={LUMINA_COLORS.expense} strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" name="Spese" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Program Distribution Pie Chart */}
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col transition-all hover:shadow-md">
               <div className="mb-4">
                  <h3 className="text-lg font-serif font-bold text-stone-800">Income Sources</h3>
                  <p className="text-xs text-stone-400">Where your abundance comes from</p>
               </div>
               <div className="flex-1 min-h-[250px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={programDistribution}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {programDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                           ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                     </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-3xl font-serif font-bold text-stone-800">{programDistribution.length}</span>
                     <span className="text-[10px] uppercase text-stone-400 font-bold tracking-wider">Streams</span>
                  </div>
               </div>
               <div className="space-y-3 mt-4">
                  {programDistribution.map((item, idx) => (
                     <div key={idx} className="flex justify-between items-center text-sm border-b border-stone-50 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2">
                           <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></span>
                           <span className="text-stone-600 font-medium">{item.name}</span>
                        </div>
                        <span className="font-bold text-stone-800">{item.value}%</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Retention & Growth Row */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Client Loyalty Chart */}
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm transition-all hover:shadow-md">
               <div className="flex justify-between items-center mb-6">
                  <div>
                     <h3 className="text-lg font-serif font-bold text-stone-800">Fidelizzazione Clienti</h3>
                     <p className="text-xs text-stone-400">Distribuzione per categoria</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: LUMINA_COLORS.successLight }}>
                     <PieIcon className="w-5 h-5" style={{ color: LUMINA_COLORS.success }} />
                  </div>
               </div>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={retentionData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 500 }} dy={10} />
                        <Tooltip
                           cursor={{ fill: '#fafaf9' }}
                           contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                           itemStyle={{ fontWeight: 600 }}
                           formatter={(value: number) => [value, 'Clienti']}
                        />
                        <Bar
                           name="Clienti"
                           dataKey="clients"
                           radius={[4, 4, 0, 0]}
                           barSize={40}
                        >
                           {retentionData.map((entry, index) => (
                              <Cell
                                 key={`cell-${index}`}
                                 fill={
                                    entry.name === 'VIP' ? LUMINA_COLORS.vip :
                                       entry.name === 'Attivi' ? LUMINA_COLORS.success :
                                          entry.name === 'A Rischio' ? LUMINA_COLORS.warning :
                                             LUMINA_COLORS.payroll
                                 }
                              />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Text Insights - Tier-Aware Intelligent Card */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-8 text-white relative overflow-hidden flex flex-col justify-center shadow-xl">
               <div className="relative z-10 max-w-lg">
                  {/* Dynamic Icon based on tier */}
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                     {subscription.tier === 'empire' ? (
                        <Crown className="w-6 h-6 text-amber-400" />
                     ) : subscription.tier === 'signature' ? (
                        <Sparkles className="w-6 h-6 text-purple-400" />
                     ) : subscription.tier === 'pro' ? (
                        <Rocket className="w-6 h-6 text-blue-400" />
                     ) : (
                        <TrendingUp className="w-6 h-6 text-green-400" />
                     )}
                  </div>

                  {/* Dynamic Title based on tier and data */}
                  <h2 className="text-3xl font-serif font-bold mb-4 tracking-tight">
                     {subscription.tier === 'empire' ? (
                        <>Eccellenza Imperiale 👑</>
                     ) : subscription.tier === 'signature' || subscription.tier === 'pro' ? (
                        <>Performance Elevata ✨</>
                     ) : (
                        <>Inizia la Crescita! 🚀</>
                     )}
                  </h2>

                  {/* Dynamic Content based on tier and stats */}
                  <p className="text-stone-300 leading-relaxed mb-8">
                     {subscription.tier === 'empire' ? (
                        <>
                           Stai sfruttando il massimo potenziale di Luminel Empire.
                           {clientStats.vipClients > 0 && (
                              <> Hai <span className="text-amber-400 font-semibold">{clientStats.vipClients} clienti VIP</span> attivi.</>
                           )}
                           {clientStats.atRiskClients > 0 && (
                              <> Attenzione: <span className="text-orange-400 font-semibold">{clientStats.atRiskClients} clienti</span> necessitano follow-up.</>
                           )}
                           {financeStats.totalRevenue > 0 && clientStats.atRiskClients === 0 && (
                              <> Fatturato totale: <span className="text-green-400 font-semibold">€{financeStats.totalRevenue.toLocaleString()}</span>.</>
                           )}
                        </>
                     ) : subscription.tier === 'signature' ? (
                        <>
                           {clientStats.totalClients > 0
                              ? `Gestisci ${clientStats.totalClients} clienti con il piano Signature.`
                              : 'Piano Signature attivo.'}
                           <span className="block mt-2 text-purple-300">
                              Passa a Empire per White Label, API complete e Success Manager dedicato.
                           </span>
                        </>
                     ) : subscription.tier === 'pro' ? (
                        <>
                           {clientStats.totalClients > 0
                              ? `Stai gestendo ${clientStats.totalClients} clienti.`
                              : 'Piano Pro attivo.'}
                           <span className="block mt-2 text-blue-300">
                              Sblocca inventario, loyalty e team analytics con Signature.
                           </span>
                        </>
                     ) : subscription.tier === 'starter' ? (
                        <>
                           Hai iniziato bene! Il piano Starter ti dà le basi.
                           <span className="block mt-2 text-green-300">
                              Passa a Pro per WhatsApp, fatturazione automatica e gestione team.
                           </span>
                        </>
                     ) : (
                        <>
                           Stai usando la versione gratuita con funzionalità limitate.
                           <span className="block mt-2 text-amber-300">
                              Attiva un piano per sbloccare CRM avanzato, AI Coach e molto altro!
                           </span>
                        </>
                     )}
                  </p>

                  {/* Dynamic CTA based on tier */}
                  {subscription.tier !== 'empire' ? (
                     <button
                        onClick={() => window.open('/#/settings', '_self')}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-900/30 active:scale-95 flex items-center gap-2"
                     >
                        {subscription.tier === 'signature' ? 'Scopri Empire' :
                           subscription.tier === 'pro' ? 'Upgrade a Signature' :
                              subscription.tier === 'starter' ? 'Passa a Pro' :
                                 'Attiva Piano Premium'}
                        <TrendingUp className="w-4 h-4" />
                     </button>
                  ) : (
                     <div className="flex items-center gap-2 text-amber-400 font-semibold">
                        <Crown className="w-5 h-5" />
                        <span>Hai il piano massimo</span>
                     </div>
                  )}
               </div>
               {/* Background Decoration */}
               <div className={`absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-3xl animate-pulse ${subscription.tier === 'empire' ? 'bg-amber-500/15' :
                     subscription.tier === 'signature' ? 'bg-purple-500/15' :
                        subscription.tier === 'pro' ? 'bg-blue-500/15' :
                           'bg-green-500/15'
                  }`}></div>
            </div>
         </div>

      </div>
   );
};
