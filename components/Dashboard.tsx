import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  CalendarCheck,
  Euro,
  TrendingUp,
  Clock,
  MoreHorizontal,
  BrainCircuit,
  HeartHandshake,
  Sparkles,
  CheckSquare,
  Plus,
  ArrowRight,
  FileText,
  UserPlus,
  Calendar,
  Trash2,
  Loader2,
  Bell,
  Lightbulb,
  Mail
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Session, SessionStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { AIAssistant } from './AIAssistant';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePrograms } from '../contexts/ProgramContext';
import { useUI } from '../contexts/UIContext';
import * as clientService from '../services/clientService';
import * as sessionService from '../services/sessionService';
import * as transactionService from '../services/transactionService';
import * as taskService from '../services/taskService';
import * as settingsService from '../services/settingsService';
import { useSubscription } from '../contexts/SubscriptionContext';
import { UpgradeBanner } from './UpgradeBanner';

// Task interface matching Supabase schema
interface DashboardTask {
  id: string;
  title: string;
  completed: boolean;
  category?: 'follow_up' | 'admin' | 'sales' | 'content';
  priority?: 'urgent' | 'normal' | 'low';
}

const KpiCard = ({ label, value, trend, icon: Icon, color, subLabel, onClick }: any) => (
  <div
    onClick={onClick}
    className={`bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color.replace('bg-', 'text-')}`}>
      <Icon className="w-16 h-16" />
    </div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-xl shadow-sm ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${trend > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
    </div>
    <div className="relative z-10">
      <h3 className="text-stone-500 text-xs font-bold uppercase tracking-wider">{label}</h3>
      <p className="text-3xl font-serif font-bold text-stone-900 mt-1">{value}</p>
      {subLabel && <p className="text-xs text-stone-400 mt-1 flex items-center gap-1 group-hover:text-gold-600 transition-colors">{subLabel} <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></p>}
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { t } = useLanguage();
  const { programs } = usePrograms();
  const { toggleNotifications } = useUI();
  const { subscription } = useSubscription();
  const [timeRange, setTimeRange] = useState('This Week');

  // --- REAL DATA STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState({
    monthlyRevenue: 0,
    activeSessions: 0,
    totalClients: 0,
    programSales: 0,
    pendingSessions: 0,
    newClientsThisMonth: 0
  });
  // FIX (1 set 2026): target di fatturato non più hardcoded a €15.000 per
  // tutti. null = il coach non l'ha ancora impostato nelle Settings.
  const [monthlyRevenueTarget, setMonthlyRevenueTarget] = useState<number | null>(null);
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [chartData, setChartData] = useState<{ name: string; revenue: number }[]>([]);

  // Task State (Supabase cloud storage)
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  // Dynamic Date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // --- LOAD REAL DATA FROM SUPABASE ---
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      console.log('[Dashboard] 🔄 Loading real data from Supabase...');

      try {
        // 1. Load Clients (for KPI)
        const clients = await clientService.getClients();
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const newClientsThisMonth = clients.filter(c => {
          const clientAny = c as any;
          return new Date(clientAny.created_at || clientAny.createdAt || 0) >= monthStart;
        }).length;

        // 1b. Load revenue target from Settings (null se il coach non l'ha ancora impostato)
        try {
          const settings = await settingsService.getSettings();
          setMonthlyRevenueTarget(settings.monthlyRevenueTarget ?? null);
        } catch (settingsError) {
          console.error('[Dashboard] ❌ Errore caricamento target fatturato:', settingsError);
        }

        // 2. Load Sessions
        const allSessions = await sessionService.getSessions();
        const todayStr = now.toDateString();
        const todaysSessionsFiltered = allSessions.filter(s =>
          new Date(s.date).toDateString() === todayStr
        );
        const scheduledSessions = allSessions.filter(s => s.status === SessionStatus.SCHEDULED);

        // 3. Load Transactions for revenue
        const transactions = await transactionService.getTransactions();
        const incomeTransactions = transactions.filter(t => t.type === 'Income');

        // Calculate monthly revenue
        const monthlyIncome = incomeTransactions.filter(t =>
          new Date(t.date) >= monthStart
        ).reduce((sum, t) => sum + t.amount, 0);

        // Calculate program sales (completed sessions with price)
        const completedSessions = allSessions.filter(s => s.status === SessionStatus.COMPLETED);

        // 4. Build weekly chart data
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
        const weekData: { name: string; revenue: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStr = date.toDateString();
          const dayRevenue = incomeTransactions
            .filter(t => new Date(t.date).toDateString() === dayStr)
            .reduce((sum, t) => sum + t.amount, 0);
          weekData.push({ name: dayNames[date.getDay()], revenue: dayRevenue });
        }

        // Update all state
        setKpis({
          monthlyRevenue: monthlyIncome,
          activeSessions: scheduledSessions.length,
          totalClients: clients.length,
          programSales: completedSessions.length,
          pendingSessions: scheduledSessions.filter(s =>
            new Date(s.date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          ).length,
          newClientsThisMonth
        });
        setTodaySessions(todaysSessionsFiltered);
        setChartData(weekData);

        console.log('[Dashboard] ✅ Real data loaded:', {
          clients: clients.length,
          sessions: allSessions.length,
          todaySessions: todaysSessionsFiltered.length,
          monthlyRevenue: monthlyIncome
        });
      } catch (error) {
        console.error('[Dashboard] ❌ Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Load tasks from Supabase
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoadingTasks(true);
      try {
        const supabaseTasks = await taskService.getTasks();
        setTasks(supabaseTasks.map(t => ({
          id: t.id,
          title: t.title,
          completed: t.completed,
          category: t.category,
          priority: t.priority
        })));
        console.log('[Dashboard] ☁️ Loaded', supabaseTasks.length, 'tasks from Supabase');
      } catch (error) {
        console.error('[Dashboard] ❌ Error loading tasks:', error);
      } finally {
        setIsLoadingTasks(false);
      }
    };
    loadTasks();
  }, []);

  const toggleTask = async (id: string) => {
    // Optimistic update
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    try {
      await taskService.toggleTaskCompleted(id);
    } catch (error) {
      console.error('[Dashboard] ❌ Failed to toggle task:', error);
      // Revert on error
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) {
      setIsAddingTask(false);
      return;
    }

    try {
      const created = await taskService.createTask({
        title: newTaskText,
        completed: false,
        category: 'admin',
        priority: 'normal'
      });
      setTasks([{ id: created.id, title: created.title, completed: created.completed, category: created.category, priority: created.priority }, ...tasks]);
      setNewTaskText('');
      setIsAddingTask(false);
    } catch (error) {
      console.error('[Dashboard] ❌ Failed to create task:', error);
      alert('Errore nel salvataggio del task. Riprova.');
    }
  };

  const handleDeleteTask = async (id: string) => {
    // Optimistic update
    const originalTasks = [...tasks];
    setTasks(tasks.filter(t => t.id !== id));
    try {
      await taskService.deleteTask(id);
    } catch (error) {
      console.error('[Dashboard] ❌ Failed to delete task:', error);
      setTasks(originalTasks); // Revert on error
    }
  };

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Buongiorno', emoji: '☀️' };
    if (hour < 18) return { text: 'Buon pomeriggio', emoji: '🌤️' };
    return { text: 'Buonasera', emoji: '🌙' };
  };
  const greeting = getGreeting();

  // Calculate today's expected revenue
  const todayExpectedRevenue = todaySessions.reduce((sum, s) => sum + (s.price || 0), 0);
  const pendingTasksCount = tasks.filter(t => !t.completed).length;
  const currentMonth = new Date().toLocaleDateString('it-IT', { month: 'long' });

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for luxury feel
      }
    }
  };

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="space-y-8 w-full max-w-[1600px] pb-12 animate-in fade-in">
      {/* Header Skeleton */}
      <div className="glass-card p-8 rounded-[2rem]">
        <div className="skeleton h-8 w-64 mb-4" />
        <div className="skeleton h-4 w-96" />
      </div>

      {/* KPI Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-6 rounded-[2rem]">
            <div className="flex justify-between items-start mb-4">
              <div className="skeleton skeleton-circle w-12 h-12" />
              <div className="skeleton h-6 w-16 rounded-full" />
            </div>
            <div className="skeleton h-3 w-24 mb-2" />
            <div className="skeleton h-8 w-20" />
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-6 rounded-[2rem]">
            <div className="skeleton h-6 w-48 mb-6" />
            <div className="skeleton h-64 w-full rounded-xl" />
          </div>
        </div>
        <div className="glass-card p-6 rounded-[2rem]">
          <div className="skeleton h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Show skeleton while loading
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 md:space-y-fib-34 w-full max-w-[1600px] pb-20 md:pb-fib-55"
    >

      {/* Upgrade Banner for Free Users */}
      {subscription.tier === 'free' && (
        <motion.div variants={itemVariants}>
          <UpgradeBanner variant="full" currentTier={subscription.tier} />
        </motion.div>
      )}

      {/* Elite Hero Header */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-white via-white to-gold-50/30 p-5 md:p-8 rounded-[2rem] border border-stone-100 shadow-sm relative overflow-hidden glass-card">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-40 h-40 md:w-80 md:h-80 bg-gradient-to-br from-gold-100/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

        <div className="relative z-10">
          {/* Greeting Header */}
          <div className="mb-2">
            <h1 className="text-2xl md:text-3xl text-display text-stone-900 flex items-center gap-2 md:gap-fib-8 flex-wrap">
              {greeting.emoji} {greeting.text}, {user.name?.split(' ')[0] || 'Coach'}
            </h1>
          </div>

          {/* Separator Line */}
          <div className="h-px bg-gradient-to-r from-gold-300 via-stone-200 to-transparent mb-4" />

          {/* Main content row */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
            {/* Smart summary */}
            <div className="space-y-1">
              <p className="text-stone-600 font-medium flex items-center gap-2 text-sm">
                📊 <span className="text-stone-800">Oggi:</span>
                <span className="font-bold text-stone-800">{todaySessions.length}</span> sessioni
                <span className="text-stone-300">·</span>
                <span className="font-bold text-stone-800">{pendingTasksCount}</span> task
                {todayExpectedRevenue > 0 && (
                  <>
                    <span className="text-stone-300">·</span>
                    <span className="text-emerald-600 font-bold">€{todayExpectedRevenue}</span>
                    <span className="text-emerald-600">in arrivo</span>
                  </>
                )}
              </p>
              <p className="text-stone-500 text-sm flex items-center gap-2">
                💰 <span className="capitalize">{currentMonth}</span>:
                <span className="font-bold text-stone-800">€{kpis.monthlyRevenue.toLocaleString('it-IT')}</span> fatturato
                {kpis.monthlyRevenue > 0 && (
                  <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">+12% vs nov</span>
                )}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: '#f5f5f4' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddingTask(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 text-stone-700 rounded-xl font-medium text-sm transition-all border border-stone-200"
              >
                <CheckSquare className="w-4 h-4" /> Quick Task
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/clients')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-stone-700 rounded-xl font-medium text-sm transition-all border border-stone-200 shadow-sm"
              >
                <UserPlus className="w-4 h-4" /> Nuovo Cliente
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/calendar')}
                className="btn-gold-radiante btn-ripple flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm"
              >
                <Plus className="w-4 h-4" /> Nuova Sessione
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Grid - Elite Design with Progress Bars */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-fib-21">
        {/* Revenue Card with Progress Bar */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          onClick={() => navigate('/finance')}
          className="bg-white p-5 md:p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden glass-card"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 text-emerald-600">
            <Euro className="w-10 h-10 md:w-14 md:h-14" />
          </div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="p-2.5 rounded-xl shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Euro className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              +12%
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-label text-stone-500">Fatturato Mensile</h3>
            <p className="text-2xl font-serif font-bold text-stone-900 mt-1 tabular-nums">€{kpis.monthlyRevenue.toLocaleString('it-IT')}</p>
            {/* Progress Bar */}
            <div className="mt-3">
              {monthlyRevenueTarget ? (
                <>
                  <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                    <span className="tabular-nums">Target: €{monthlyRevenueTarget.toLocaleString('it-IT')}</span>
                    <span className="font-bold text-emerald-600 tabular-nums">{Math.min(100, Math.round((kpis.monthlyRevenue / monthlyRevenueTarget) * 100))}%</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (kpis.monthlyRevenue / monthlyRevenueTarget) * 100)}%` }}
                    />
                  </div>
                </>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/settings'); }}
                  className="text-[10px] text-gold-600 hover:underline font-medium"
                >
                  + Imposta un obiettivo mensile
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sessions Card with Confirm Badge */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          onClick={() => navigate('/calendar')}
          className="bg-white p-5 md:p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden glass-card"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 text-gold-600">
            <CalendarCheck className="w-10 h-10 md:w-14 md:h-14" />
          </div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="p-2.5 rounded-xl shadow-sm bg-gradient-to-br from-gold-500 to-gold-600">
              <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            {kpis.pendingSessions > 0 && (
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                {kpis.pendingSessions} da confermare
              </span>
            )}
          </div>
          <div className="relative z-10">
            <h3 className="text-label text-stone-500">Sessioni Attive</h3>
            <p className="text-2xl font-serif font-bold text-stone-900 mt-1 tabular-nums">{kpis.activeSessions}</p>
            <p className="text-xs text-stone-400 mt-2">
              {kpis.pendingSessions > 0 ? (
                <span className="text-amber-600 font-medium flex items-center gap-1">
                  ⚠️ Conferma in attesa
                </span>
              ) : (
                <span className="text-emerald-600">✓ Tutto confermato</span>
              )}
            </p>
          </div>
        </motion.div>


        {/* Clients Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          onClick={() => navigate('/clients')}
          className="bg-white p-5 md:p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden glass-card"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 text-stone-600">
            <HeartHandshake className="w-10 h-10 md:w-14 md:h-14" />
          </div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="p-2.5 rounded-xl shadow-sm bg-gradient-to-br from-stone-600 to-stone-700">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            {kpis.newClientsThisMonth > 0 && (
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                +{kpis.newClientsThisMonth} nuovi
              </span>
            )}
          </div>
          <div className="relative z-10">
            <h3 className="text-label text-stone-500">Community</h3>
            <p className="text-2xl font-serif font-bold text-stone-900 mt-1 tabular-nums">{kpis.totalClients}</p>
            <p className="text-xs text-stone-400 mt-2">clienti totali</p>
          </div>
        </motion.div>

        {/* Sales Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          onClick={() => navigate('/analytics')}
          className="bg-white p-5 md:p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden glass-card"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 text-emerald-600">
            <BrainCircuit className="w-10 h-10 md:w-14 md:h-14" />
          </div>
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="p-2.5 rounded-xl shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              +15%
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-label text-stone-500">Vendite</h3>
            <p className="text-2xl font-serif font-bold text-stone-900 mt-1 tabular-nums">{kpis.programSales}</p>
            <p className="text-xs text-stone-400 mt-2">sessioni completate</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-fib-34 h-auto">

        {/* Left Column (Stats & Tasks) */}
        <div className="lg:col-span-2 space-y-6 md:space-y-fib-34">
          {/* Revenue Chart */}
          <motion.div variants={itemVariants} className="bg-white p-5 md:p-fib-21 rounded-[2rem] border border-stone-100 shadow-sm glass-card">
            <div className="flex justify-between items-center mb-fib-21">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900">{t('dashboard.energyExchange')}</h3>
                <p className="text-xs text-stone-400">{t('dashboard.incomeFlow')}</p>
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1 text-sm outline-none text-stone-700 font-medium cursor-pointer hover:border-gold-300"
              >
                <option>Questa settimana</option>
                <option>Questo mese</option>
                <option>Ultimo trimestre</option>
              </select>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ce9341" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ce9341" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 500 }} tickFormatter={(value) => `€${value}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1c1917', fontWeight: 600 }}
                    formatter={(value: number) => [`€${value}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#ce9341" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Insight Message */}
            <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-transparent rounded-xl border border-amber-100">
              <p className="text-sm text-amber-800 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>
                  <span className="font-bold">Insight:</span> {chartData.length > 0 ? (
                    <>Picco {chartData.reduce((max, d) => d.revenue > max.revenue ? d : max, chartData[0])?.name}: €{chartData.reduce((max, d) => d.revenue > max.revenue ? d : max, chartData[0])?.revenue} — considera di aggiungere slot extra</>
                  ) : (
                    <>Aggiungi transazioni per vedere insights sul tuo fatturato</>
                  )}
                </span>
              </p>
            </div>
          </motion.div>

          {/* Coach's Focus / To-Do */}
          <motion.div variants={itemVariants} className="bg-white p-fib-21 rounded-[2rem] border border-stone-100 shadow-sm glass-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-gold-500" />
                {t('dashboard.coachFocus')}
              </h3>
              <button
                onClick={() => setIsAddingTask(true)}
                className="text-xs font-bold text-stone-400 hover:text-gold-600 uppercase tracking-wide flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> {t('dashboard.addTask')}
              </button>
            </div>

            <div className="space-y-3">
              {/* Add Task Input */}
              {isAddingTask && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                  <input
                    autoFocus
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') setIsAddingTask(false); }}
                    className="flex-1 bg-stone-50 border border-gold-300 rounded-lg p-2 text-sm outline-none"
                    placeholder="Type task & press Enter..."
                  />
                  <button onClick={addTask} className="text-xs font-bold text-gold-600">SAVE</button>
                </div>
              )}

              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 group py-2 px-3 rounded-lg hover:bg-stone-50 transition-colors">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${task.completed
                      ? 'bg-emerald-500 border-emerald-500 scale-95'
                      : 'border-stone-300 hover:border-gold-400 hover:scale-105'
                      }`}
                  >
                    {task.completed && <Plus className="w-3 h-3 text-white transform rotate-45" />}
                  </button>
                  <span className={`text-sm flex-1 ${task.completed ? 'text-stone-300 line-through' : 'text-stone-700'}`}>
                    {task.title}
                  </span>
                  {/* Priority Badge */}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${task.priority === 'urgent'
                    ? 'bg-red-100 text-red-600 border border-red-200'
                    : task.priority === 'low'
                      ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                      : task.category === 'follow_up'
                        ? 'bg-blue-100 text-blue-600 border border-blue-200'
                        : task.category === 'sales'
                          ? 'bg-amber-100 text-amber-600 border border-amber-200'
                          : 'bg-stone-100 text-stone-500 border border-stone-200'
                    }`}>
                    {task.priority === 'urgent' ? '🔴 Urgente' :
                      task.priority === 'low' ? '🟢 Low' :
                        task.category === 'follow_up' ? '🔵 Follow-up' :
                          task.category === 'sales' ? '💰 Vendite' :
                            'Admin'}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1, color: '#ef4444' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-stone-300 transition-all p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column (Sessions Elite) */}
        <motion.div variants={itemVariants} className="bg-white p-fib-21 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col h-full glass-card">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              📆 Sessioni di Oggi
            </h3>
            <button onClick={() => navigate('/calendar')} className="text-gold-700 text-xs font-bold hover:underline uppercase tracking-wide">
              Vedi Calendario
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
              </div>
            ) : todaySessions.length === 0 ? (
              // Empty State
              <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 font-medium">Nessuna sessione oggi</p>
                <p className="text-xs text-stone-400 mt-1">Giornata libera o tempo per pianificare?</p>
                <button
                  onClick={() => navigate('/calendar')}
                  className="mt-4 px-4 py-2 bg-gold-500 text-white text-sm font-medium rounded-lg hover:bg-gold-600 transition-colors"
                >
                  Prenota una sessione
                </button>
              </div>
            ) : (
              // Elite Sessions List
              todaySessions.map((apt) => {
                // Calculate countdown
                const sessionDate = new Date(apt.date);
                const now = new Date();
                const diffMs = sessionDate.getTime() - now.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                const hours = Math.floor(diffMins / 60);
                const mins = diffMins % 60;
                const isPast = diffMs < 0;
                const isWithinHour = diffMins > 0 && diffMins <= 60;

                // Get initials for avatar
                const initials = apt.clientName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??';

                return (
                  <motion.div
                    key={apt.id}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="p-4 rounded-xl border border-stone-100 hover:border-gold-300 hover:shadow-md transition-all group bg-gradient-to-r from-white to-stone-50/50"
                  >
                    <div className="flex gap-4">
                      {/* Client Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                        {initials}
                      </div>

                      {/* Session Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-stone-900 text-sm truncate">{apt.clientName}</h4>
                            <p className="text-xs text-stone-500 font-medium">{apt.programName || 'Sessione'}</p>
                          </div>
                          {/* Countdown Badge */}
                          <div className={`text-[10px] px-2 py-1 rounded-lg font-bold whitespace-nowrap ${isPast ? 'bg-stone-100 text-stone-500' :
                            isWithinHour ? 'bg-amber-100 text-amber-700 animate-pulse' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                            {isPast ? '⏱️ Scaduta' : `⏱️ tra ${hours}h ${mins}m`}
                          </div>
                        </div>

                        {/* Time & Duration */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {sessionDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span>{apt.type === 'Group' ? '90m' : '60m'}</span>
                          {apt.price && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 font-medium">€{apt.price}</span>
                            </>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/calendar')}
                            className="px-3 py-1.5 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-[11px] font-bold rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all flex items-center gap-1"
                          >
                            ▶ Inizia Sessione
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: '#f5f5f4' }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1.5 bg-stone-100 text-stone-600 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            📨 Reminder
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05, color: '#44403c' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/clients')}
                            className="px-3 py-1.5 bg-transparent text-stone-400 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            📋 Note
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}

            {/* Add Session Button */}
            <button onClick={() => navigate('/calendar')} className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 text-sm font-bold hover:border-gold-300 hover:text-gold-600 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Aggiungi Sessione
            </button>
          </div>
        </motion.div>
      </div>

      {/* Floating AI Assistant */}
      <AIAssistant />
    </motion.div>
  );
};
