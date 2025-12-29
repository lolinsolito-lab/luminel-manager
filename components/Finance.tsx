
import React, { useState, useMemo } from 'react';
import {
   Download,
   FileText,
   ArrowUpRight,
   ArrowDownRight,
   DollarSign,
   TrendingUp,
   Users,
   Plus,
   Filter,
   Calendar,
   CreditCard,
   Briefcase,
   X,
   CheckCircle2,
   Euro,
   AlertCircle,
   Printer,
   Send,
   Building,
   Loader2,
   ChevronRight,
   Settings,
   Trash2,
   UserPlus,
   Check,
   MessageCircle,
   Share2
} from 'lucide-react';
import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   Legend
} from 'recharts';
import { Transaction, TransactionType } from '../types';
import { syncTransaction, syncTransactionToSheets, sendReceiptEmail } from '../services/integrationService';
import { APP_CONFIG } from '../config';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { isSupabaseConfigured } from '../services/supabaseClient';
import * as transactionService from '../services/transactionService';

// Helper to get dynamic dates relative to today
const getRelativeDate = (daysOffset: number) => {
   const d = new Date();
   d.setDate(d.getDate() + daysOffset);
   return d.toISOString().split('T')[0];
};

// === LUMINA ROYAL PALETTE ===
const LUMINA_COLORS = {
   income: '#D4A853',  // Gold Royal
   expense: '#C9A18C',  // Rose Champagne
   payroll: '#5B7C99',  // Navy Royal
   success: '#8FAE8B',  // Sage Green
   warning: '#D4A574',  // Amber Champagne
   neutral: '#A8A095',  // Pearl Gray
   vip: '#C4956A',  // Deep Gold
};


// Mock Financial Data
const initialTransactions: Transaction[] = [
   // Income
   { id: '1', description: 'Facial Treatment - Sophia Loren', amount: 250, type: 'Income', category: 'Service', date: getRelativeDate(0), status: 'Paid', paymentMethod: 'Credit Card' },
   { id: '2', description: 'Monthly Coaching - James Bond', amount: 1200, type: 'Income', category: 'Coaching', date: getRelativeDate(-1), status: 'Paid', paymentMethod: 'Bank Transfer' },
   { id: '3', description: 'Workshop Ticket - Group A', amount: 850, type: 'Income', category: 'Workshop', date: getRelativeDate(-2), status: 'Paid', paymentMethod: 'Credit Card' },

   // Expenses
   { id: '4', description: 'Essential Oils Restock', amount: 450, type: 'Expense', category: 'Inventory', date: getRelativeDate(-1), status: 'Paid', paymentMethod: 'Credit Card' },
   { id: '5', description: 'Studio Rent (Monthly)', amount: 2000, type: 'Expense', category: 'Rent', date: getRelativeDate(-10), status: 'Paid', paymentMethod: 'Bank Transfer' },
   { id: '6', description: 'Facebook Ads Campaign', amount: 300, type: 'Expense', category: 'Marketing', date: getRelativeDate(-5), status: 'Paid', paymentMethod: 'Credit Card' },

   // Payroll (Matches initial team)
   { id: '7', description: 'Salary - Assistant Anna', amount: 1500, type: 'Payroll', category: 'Salary', date: getRelativeDate(2), status: 'Pending', paymentMethod: 'Bank Transfer' },
   { id: '8', description: 'Contractor - Yoga Teacher', amount: 400, type: 'Payroll', category: 'Contractor', date: getRelativeDate(-15), status: 'Paid', paymentMethod: 'Bank Transfer' },
   { id: '9', description: 'Private Consultation', amount: 150, type: 'Income', category: 'Service', date: getRelativeDate(0), status: 'Pending', paymentMethod: 'Cash' },
];

export const Finance: React.FC = () => {
   const { user } = useUser();
   const { t, language } = useLanguage();
   const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
   const [timeRange, setTimeRange] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month');

   // Interactive Filters
   const [activeCardFilter, setActiveCardFilter] = useState<'All' | 'Income' | 'Expense' | 'Payroll'>('All');

   // Modal State
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isReceiptOpen, setIsReceiptOpen] = useState(false);
   const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
   const [recipientEmail, setRecipientEmail] = useState(''); // New state for email receipt
   const [isSaving, setIsSaving] = useState(false);
   const [newTx, setNewTx] = useState<Partial<Transaction>>({
      description: '',
      amount: 0,
      type: 'Income',
      category: 'Service',
      date: new Date().toISOString().split('T')[0],
      status: 'Paid',
      paymentMethod: 'Credit Card'
   });

   // Receipt Modal State
   const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
   const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
   // Payroll Processing State
   const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

   // Load transactions from Supabase on mount
   React.useEffect(() => {
      const loadTransactions = async () => {
         setIsLoadingTransactions(true);

         try {
            // Try Supabase first if configured
            if (isSupabaseConfigured()) {
               console.log('[Finance] ☁️ Loading transactions from Supabase...');
               const supabaseTransactions = await transactionService.getTransactions();

               if (supabaseTransactions.length > 0) {
                  setTransactions(supabaseTransactions);
                  localStorage.setItem('lumina_transactions_cache', JSON.stringify(supabaseTransactions));
                  console.log(`[Finance] ✅ Loaded ${supabaseTransactions.length} transactions from Supabase`);
                  setIsLoadingTransactions(false);
                  return;
               }
            }

            // Fallback to cache
            const cachedTransactions = localStorage.getItem('lumina_transactions_cache');
            if (cachedTransactions) {
               try {
                  const parsed = JSON.parse(cachedTransactions);
                  setTransactions(parsed);
                  console.log('[Finance] 💾 Loaded transactions from cache');
               } catch (e) {
                  console.warn('[Finance] ⚠️ Failed to parse cached transactions');
               }
            }

            // If no data, keep mock data for demo
            if (!isSupabaseConfigured()) {
               console.log('[Finance] 💡 Using mock data for demo');
            }
         } catch (error) {
            console.error('[Finance] ❌ Error loading transactions:', error);
         }

         setIsLoadingTransactions(false);
      };

      loadTransactions();
   }, []);

   // --- Filtering Logic ---
   const filteredTransactions = useMemo(() => {
      const now = new Date();
      // Normalize "now" to midnight for accurate Day comparison
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      return transactions.filter(t => {
         // 1. Time Range Filter
         const tDate = new Date(t.date);
         const tDateMidnight = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate());
         let matchesTime = true;

         if (timeRange === 'Day') matchesTime = tDateMidnight.getTime() === today.getTime();
         if (timeRange === 'Week') {
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 7);
            matchesTime = tDateMidnight >= oneWeekAgo;
         }
         if (timeRange === 'Month') matchesTime = tDateMidnight.getMonth() === today.getMonth() && tDateMidnight.getFullYear() === today.getFullYear();
         if (timeRange === 'Year') matchesTime = tDateMidnight.getFullYear() === today.getFullYear();

         // 2. Card Category Filter
         let matchesCategory = true;
         if (activeCardFilter !== 'All') {
            matchesCategory = t.type === activeCardFilter;
         }

         return matchesTime && matchesCategory;
      });
   }, [transactions, timeRange, activeCardFilter]);

   // --- Calculations ---
   const financials = useMemo(() => {
      let income = 0;
      let expense = 0;
      let payroll = 0;

      // Calculate totals based on ALL transactions in the time range (ignoring the card filter for the top totals)
      const baseTransactionsForTotals = transactions.filter(t => {
         const now = new Date();
         const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
         const tDate = new Date(t.date);
         const tDateMidnight = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate());

         if (timeRange === 'Day') return tDateMidnight.getTime() === today.getTime();
         if (timeRange === 'Week') {
            const oneWeekAgo = new Date(today);
            oneWeekAgo.setDate(today.getDate() - 7);
            return tDateMidnight >= oneWeekAgo;
         }
         if (timeRange === 'Month') return tDateMidnight.getMonth() === today.getMonth() && tDateMidnight.getFullYear() === today.getFullYear();
         if (timeRange === 'Year') return tDateMidnight.getFullYear() === today.getFullYear();
         return true;
      });

      baseTransactionsForTotals.forEach(t => {
         if (t.type === 'Income') income += t.amount;
         if (t.type === 'Expense') expense += t.amount;
         if (t.type === 'Payroll') payroll += t.amount;
      });

      return {
         income,
         expense,
         payroll,
         totalExpenses: expense + payroll,
         netIncome: income - (expense + payroll)
      };
   }, [transactions, timeRange]);

   // --- Chart Data Preparation ---
   const chartData = useMemo(() => {
      const data = [
         { name: 'Fatturato', value: financials.income, fill: LUMINA_COLORS.income },
         { name: 'Spese Op.', value: financials.expense, fill: LUMINA_COLORS.expense },
         { name: 'Payroll', value: financials.payroll, fill: LUMINA_COLORS.payroll },
      ];
      return data;
   }, [financials]);

   const isProfitable = financials.netIncome >= 0;

   // --- Handlers ---
   const handleSaveTransaction = async () => {
      if (!newTx.description || !newTx.amount) return;

      setIsSaving(true);
      try {
         const transaction: Transaction = {
            id: newTx.id || Math.random().toString(36).substr(2, 9),
            ...newTx,
            date: newTx.date || new Date().toISOString().split('T')[0],
            type: newTx.type || 'income',
            category: newTx.category || 'Coaching',
            paymentMethod: newTx.paymentMethod || 'Stripe',
            status: newTx.status || 'completed'
         } as Transaction;

         // Try Supabase first if configured
         if (isSupabaseConfigured()) {
            try {
               if (newTx.id) {
                  await transactionService.updateTransaction(newTx.id, transaction);
               } else {
                  await transactionService.createTransaction(transaction);
               }
               console.log('[Finance] ☁️ Transaction saved to Supabase');
            } catch (error) {
               console.error('[Finance] ❌ Supabase error:', error);
               throw error;
            }
         } else {
            // Fallback to Make.com
            await syncTransaction(transaction);

            // Sync to Google Sheets for persistence
            try {
               await syncTransactionToSheets(transaction);
               console.log('[Finance] ✅ Transaction saved to Sheets');
            } catch (error) {
               console.warn('[Finance] ⚠️ Failed to save to Sheets:', error);
            }
         }

         // Update local state
         if (newTx.id) {
            setTransactions(transactions.map(t => t.id === transaction.id ? transaction : t));
         } else {
            setTransactions([transaction, ...transactions]);
         }

         // Save to cache
         const updatedTransactions = newTx.id
            ? transactions.map(t => t.id === transaction.id ? transaction : t)
            : [transaction, ...transactions];
         localStorage.setItem('lumina_transactions_cache', JSON.stringify(updatedTransactions));

         setIsModalOpen(false);
         setNewTx({ type: 'income', category: 'Coaching', amount: 0, description: '', paymentMethod: 'Stripe', status: 'completed' });
      } catch (error) {
         console.error('[Finance] ❌ Error saving transaction:', error);
         alert('❌ Errore nel salvataggio. Riprova.');
      } finally {
         setIsSaving(false);
      }
   };

   const handleDeleteTransaction = async () => {
      if (!newTx.id) return;
      if (confirm("Are you sure you want to delete this record?")) {
         setTransactions(transactions.filter(t => t.id !== newTx.id));
         setIsModalOpen(false);
         // Optional: await syncDeleteTransaction(newTx.id); 
      }
   };

   const openReceipt = (t: Transaction) => {
      setSelectedReceipt(t);
      setEmailStatus('idle');
      setIsReceiptOpen(true);
   };

   const handleEdit = (t: Transaction) => {
      setNewTx({ ...t });
      setIsModalOpen(true);
   };

   const handleOpenGenerateModal = () => {
      setIsGenerateModalOpen(true);
   }

   const handleActualPrint = () => {
      setIsGenerateModalOpen(false);
      // Use timeout to allow modal to close before print dialog opens
      setTimeout(() => {
         window.print();
      }, 300);
   };

   const handleEmailReceipt = async () => {
      if (selectedReceipt) {
         if (!recipientEmail) {
            alert("Please enter a recipient email address.");
            return;
         }

         setEmailStatus('sending');
         try {
            const success = await sendReceiptEmail(selectedReceipt, recipientEmail);
            if (success) {
               setEmailStatus('sent');
               setIsGenerateModalOpen(false);
               alert(`Email sent successfully to ${recipientEmail}`);
               setRecipientEmail('');
            } else {
               setEmailStatus('idle');
               alert("Failed to send receipt to Make.com. Please check your internet connection or Webhook URL.");
            }
         } catch (error) {
            console.error("Failed to send receipt:", error);
            setEmailStatus('idle');
            alert("An unexpected error occurred.");
         }
      }
   }

   const handleWhatsAppReceipt = () => {
      if (!selectedReceipt) return;

      const clientName = getClientName(selectedReceipt.description);
      // Mock number as we don't have it directly in transaction, in real app we'd fetch it
      // Using a generic message for now
      const message = `Ciao ${clientName}, ecco la ricevuta per ${selectedReceipt.description} di €${selectedReceipt.amount}. Grazie!`;
      const encodedMessage = encodeURIComponent(message);

      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
      setIsGenerateModalOpen(false);
   }

   const getClientName = (desc: string) => {
      if (desc.includes('-')) return desc.split('-')[1].trim();
      if (desc.includes('Salary')) return 'Employee: ' + desc.split('-')[1].trim();
      return 'Client';
   };

   const translatePaymentMethod = (method: string = '') => {
      if (language === 'it') {
         if (method === 'Credit Card') return 'Carta di Credito';
         if (method === 'Bank Transfer') return 'Bonifico Bancario';
         if (method === 'Cash') return 'Contanti';
      }
      return method;
   };

   return (
      <div className="space-y-8 w-full max-w-[1600px] pb-10">

         {/* CSS for Perfect Printing */}
         <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-modal, #invoice-modal * {
            visibility: visible;
          }
          #invoice-modal {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background: white;
            z-index: 9999;
          }
          /* Hide buttons in print */
          .no-print {
            display: none !important;
          }
        }
      `}</style>

         {/* Top Header & Controls */}
         <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm print:hidden">
            <div>
               <h1 className="text-3xl font-serif font-bold text-stone-900">{t('finance.title')}</h1>
               <p className="text-stone-500 mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('finance.tracking')} <span className="font-bold text-stone-800">{timeRange}</span>
               </p>
            </div>

            <div className="flex gap-3">
               <div className="flex bg-stone-100 p-1 rounded-xl">
                  {['Day', 'Week', 'Month', 'Year'].map((range) => (
                     <button
                        key={range}
                        onClick={() => setTimeRange(range as any)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${timeRange === range
                           ? 'bg-white text-stone-900 shadow-sm'
                           : 'text-stone-500 hover:text-stone-700'
                           }`}
                     >
                        {range}
                     </button>
                  ))}
               </div>
               <button
                  onClick={() => {
                     setNewTx({ description: '', amount: 0, type: 'Income', category: 'Service', date: new Date().toISOString().split('T')[0], status: 'Paid', paymentMethod: 'Credit Card' });
                     setIsModalOpen(true);
                  }}
                  className="bg-stone-800 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-700 shadow-lg shadow-stone-200 transition-colors"
               >
                  <Plus className="w-5 h-5" /> {t('finance.newEntry')}
               </button>
            </div>
         </div>

         {/* KPI Cards (Hidden on Print) - NOW CLICKABLE FILTERS */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500 print:hidden">

            {/* Net Profit (Filter: All) */}
            <div
               onClick={() => setActiveCardFilter('All')}
               className={`bg-white p-6 rounded-2xl border shadow-sm transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden group ${activeCardFilter === 'All' ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-emerald-100' : 'border-emerald-100 hover:border-emerald-300'
                  }`}
            >
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-xl ${isProfitable ? 'bg-emerald-50' : 'bg-red-50'}`}>
                        <Euro className={`w-6 h-6 ${isProfitable ? 'text-emerald-600' : 'text-red-600'}`} />
                     </div>
                     <span className={`text-xs font-bold px-2 py-1 rounded-full ${isProfitable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {isProfitable ? t('finance.gain') : t('finance.loss')}
                     </span>
                  </div>
                  <p className="text-stone-500 text-xs font-bold uppercase tracking-wider">{t('finance.netProfit')}</p>
                  <h3 className={`text-3xl font-serif font-bold mt-1 ${isProfitable ? 'text-stone-900' : 'text-red-600'}`}>
                     €{financials.netIncome.toLocaleString()}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-xs font-medium text-stone-400">
                     {isProfitable ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-red-500" />}
                     <span>{t('finance.cashFlow')}</span>
                  </div>
               </div>
            </div>

            {/* Revenue (Filter: Income) */}
            <div
               onClick={() => setActiveCardFilter('Income')}
               className={`bg-white p-6 rounded-2xl border shadow-sm transition-all cursor-pointer hover:scale-[1.02] ${activeCardFilter === 'Income' ? 'ring-2' : 'border-stone-200'}`}
               style={activeCardFilter === 'Income' ? { borderColor: LUMINA_COLORS.income, boxShadow: `0 4px 20px ${LUMINA_COLORS.income}30` } : {}}
            >
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${LUMINA_COLORS.income}20` }}>
                     <ArrowUpRight className="w-6 h-6" style={{ color: LUMINA_COLORS.income }} />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ color: LUMINA_COLORS.income, backgroundColor: `${LUMINA_COLORS.income}15` }}>Fatturato</span>
               </div>
               <p className="text-stone-500 text-xs font-bold uppercase tracking-wider">{t('finance.totalRevenue')}</p>
               <h3 className="text-3xl font-serif font-bold mt-1" style={{ color: LUMINA_COLORS.income }}>€{financials.income.toLocaleString()}</h3>
            </div>

            {/* Expenses (Filter: Expense) */}
            <div
               onClick={() => setActiveCardFilter('Expense')}
               className={`bg-white p-6 rounded-2xl border shadow-sm transition-all cursor-pointer hover:scale-[1.02] ${activeCardFilter === 'Expense' ? 'ring-2' : 'border-stone-200'}`}
               style={activeCardFilter === 'Expense' ? { borderColor: LUMINA_COLORS.expense, boxShadow: `0 4px 20px ${LUMINA_COLORS.expense}30` } : {}}
            >
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${LUMINA_COLORS.expense}20` }}>
                     <ArrowDownRight className="w-6 h-6" style={{ color: LUMINA_COLORS.expense }} />
                  </div>
               </div>
               <p className="text-stone-500 text-xs font-bold uppercase tracking-wider">{t('finance.opCosts')}</p>
               <h3 className="text-3xl font-serif font-bold mt-1" style={{ color: LUMINA_COLORS.expense }}>€{financials.expense.toLocaleString()}</h3>
            </div>

            {/* Payroll (Filter: Payroll) */}
            <div
               onClick={() => setActiveCardFilter('Payroll')}
               className={`bg-white p-6 rounded-2xl border shadow-sm transition-all cursor-pointer hover:scale-[1.02] ${activeCardFilter === 'Payroll' ? 'ring-2' : 'border-stone-200'}`}
               style={activeCardFilter === 'Payroll' ? { borderColor: LUMINA_COLORS.payroll, boxShadow: `0 4px 20px ${LUMINA_COLORS.payroll}30` } : {}}
            >
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${LUMINA_COLORS.payroll}20` }}>
                     <Users className="w-6 h-6" style={{ color: LUMINA_COLORS.payroll }} />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ color: LUMINA_COLORS.payroll, backgroundColor: `${LUMINA_COLORS.payroll}15` }}>Staff</span>
               </div>
               <p className="text-stone-500 text-xs font-bold uppercase tracking-wider">{t('finance.payroll')}</p>
               <h3 className="text-3xl font-serif font-bold mt-1" style={{ color: LUMINA_COLORS.payroll }}>€{financials.payroll.toLocaleString()}</h3>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
            {/* Main Chart Section */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-serif font-bold text-stone-800">{t('finance.breakdown')}</h3>
                  <div className="flex gap-2 text-xs">
                     {activeCardFilter !== 'All' && (
                        <span className="bg-stone-800 text-white px-3 py-1 rounded-full flex items-center gap-1 font-bold">
                           Filtering: {activeCardFilter} <X className="w-3 h-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); setActiveCardFilter('All'); }} />
                        </span>
                     )}
                     <button className="text-xs font-bold text-stone-400 hover:text-gold-600 uppercase flex items-center gap-1">
                        <Filter className="w-3 h-3" /> Report
                     </button>
                  </div>
               </div>
               <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f5f5f4" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12, fontWeight: 600 }} width={100} />
                        <Tooltip
                           cursor={{ fill: 'transparent' }}
                           contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                           formatter={(value: number) => [`€${value.toLocaleString()}`, 'Amount']}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40} animationDuration={800} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Team Link Card */}
            <a
               href="#/team"
               className="bg-gradient-to-br from-stone-50 to-stone-100 p-6 rounded-2xl border border-stone-200 hover:shadow-lg transition-all group flex items-center justify-between"
            >
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${LUMINA_COLORS.payroll}20` }}>
                     <Briefcase className="w-6 h-6" style={{ color: LUMINA_COLORS.payroll }} />
                  </div>
                  <div>
                     <h3 className="font-serif font-bold text-lg text-stone-800 group-hover:text-stone-900">{t('finance.payrollCenter')}</h3>
                     <p className="text-sm text-stone-500">Gestisci dipendenti, collaboratori e pagamenti</p>
                  </div>
               </div>
               <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-stone-600 transition-colors" />
            </a>
         </div>


         {/* Recent Transactions List (Hidden on Print) */}
         <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden print:hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
               <h3 className="text-lg font-serif font-bold text-stone-800">
                  {activeCardFilter === 'All' ? t('finance.smartLedger') : `${activeCardFilter} Records`}
               </h3>
               <button className="text-sm text-gold-600 font-medium hover:underline flex items-center gap-1">
                  <Download className="w-4 h-4" /> Export CSV
               </button>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
               {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                  <div
                     key={t.id}
                     onClick={() => handleEdit(t)}
                     className="flex items-center justify-between p-4 border-b border-stone-50 hover:bg-stone-50 transition-colors last:border-none group cursor-pointer"
                  >
                     <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full flex-shrink-0 ${t.type === 'Income' ? 'bg-green-100 text-green-600' :
                           t.type === 'Expense' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                           }`}>
                           {t.type === 'Income' ? <ArrowUpRight className="w-5 h-5" /> :
                              t.type === 'Expense' ? <ArrowDownRight className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>
                        <div>
                           <p className="font-bold text-stone-800 text-sm group-hover:text-gold-600 transition-colors">{t.description}</p>
                           <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-stone-400 font-mono">{t.date}</span>
                              <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded border border-stone-200 uppercase">{t.category}</span>
                              {t.status === 'Pending' && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded uppercase font-bold">Pending</span>}
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="text-right">
                           <span className={`font-bold font-mono block ${t.type === 'Income' ? 'text-green-600' : 'text-stone-800'
                              }`}>
                              {t.type === 'Income' ? '+' : '-'}€{t.amount.toLocaleString()}
                           </span>
                           <span className="text-[10px] text-stone-400 flex items-center justify-end gap-1">
                              {translatePaymentMethod(t.paymentMethod)}
                           </span>
                        </div>
                        <button
                           onClick={(e) => {
                              e.stopPropagation();
                              openReceipt(t);
                           }}
                           className="text-stone-300 hover:text-stone-600 p-2 rounded-full hover:bg-stone-100 transition-all"
                           title="View Receipt/Invoice"
                        >
                           <FileText className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               )) : (
                  <div className="p-10 text-center text-stone-400">
                     <p>No transactions found for this period or category.</p>
                  </div>
               )}
            </div>
         </div>

         {/* --- INVOICE / RECEIPT MODAL (Optimized for Print with Translations) --- */}
         {isReceiptOpen && selectedReceipt && (
            <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:absolute print:inset-0 print:z-[1000]">
               <div id="invoice-modal" className="bg-white w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative print:shadow-none print:w-full print:max-w-none">

                  {/* Paper Layout */}
                  <div className="p-8 md:p-12 print:p-0">

                     {/* 1. Header Area */}
                     <div className="flex justify-between items-start border-b border-stone-100 pb-8 mb-8">
                        <div>
                           <h2 className="font-serif font-bold text-2xl text-stone-900 tracking-tight flex items-center gap-2">
                              <Building className="w-6 h-6 text-gold-500" /> {user.companyName || APP_CONFIG.appName}
                           </h2>
                           <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">
                              {user.companyName ? t('finance.invoice.fiscalDoc') : 'Wellness & Performance'}
                           </p>
                        </div>
                        <div className="text-right">
                           <h3 className="text-3xl font-serif font-bold text-stone-900 uppercase tracking-wider mb-1">
                              {selectedReceipt.type === 'Income' ? t('finance.invoice.receipt') : t('finance.invoice.expense')}
                           </h3>
                           <p className="text-stone-400 font-mono text-sm">#{selectedReceipt.id.toUpperCase()}</p>
                           <p className="text-stone-500 font-medium text-sm mt-1">{selectedReceipt.date}</p>
                        </div>
                     </div>

                     {/* 2. Addresses */}
                     <div className="flex justify-between mb-12">
                        <div>
                           <h4 className="text-[10px] font-bold uppercase text-stone-400 mb-2 tracking-wider">{t('finance.invoice.issuedBy')}</h4>
                           <p className="font-bold text-stone-800 text-sm">{user.companyName || 'Lumina Center'}</p>
                           <div className="text-stone-500 text-sm whitespace-pre-wrap max-w-[200px]">
                              {user.companyAddress || 'Indirizzo non configurato\nConfigura nel Profilo'}
                           </div>
                           {user.vatId && <p className="text-stone-500 text-sm mt-1">P.IVA: {user.vatId}</p>}
                        </div>
                        <div className="text-right">
                           <h4 className="text-[10px] font-bold uppercase text-stone-400 mb-2 tracking-wider">{t('finance.invoice.billTo')}</h4>
                           <p className="font-bold text-stone-800 text-sm">{getClientName(selectedReceipt.description)}</p>
                           <p className="text-stone-500 text-sm">Cliente Privato</p>
                        </div>
                     </div>

                     {/* 3. Line Items Table */}
                     <div className="mb-8">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="border-b-2 border-stone-100">
                                 <th className="py-3 text-xs font-bold uppercase text-stone-500 tracking-wider">{t('finance.invoice.description')}</th>
                                 <th className="py-3 text-xs font-bold uppercase text-stone-500 tracking-wider text-right">{t('finance.invoice.category')}</th>
                                 <th className="py-3 text-xs font-bold uppercase text-stone-500 tracking-wider text-right">{t('finance.invoice.amount')}</th>
                              </tr>
                           </thead>
                           <tbody>
                              <tr className="border-b border-stone-50">
                                 <td className="py-4 text-stone-800 font-medium text-sm">{selectedReceipt.description}</td>
                                 <td className="py-4 text-stone-500 text-right text-sm">{selectedReceipt.category}</td>
                                 <td className="py-4 text-stone-800 font-bold text-right text-sm">€{selectedReceipt.amount.toLocaleString()}.00</td>
                              </tr>
                              {/* Filler rows for aesthetic height in paper */}
                              <tr className="h-12"><td colSpan={3}></td></tr>
                           </tbody>
                        </table>
                     </div>

                     {/* 4. Totals */}
                     <div className="flex justify-end mb-12">
                        <div className="w-1/2 space-y-3">
                           <div className="flex justify-between text-sm text-stone-500">
                              <span>{t('finance.invoice.taxable')}</span>
                              <span>€{(selectedReceipt.amount / 1.22).toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-sm text-stone-500">
                              <span>{t('finance.invoice.vat')} (22%)</span>
                              <span>€{((selectedReceipt.amount / 1.22) * 0.22).toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-xl font-bold text-stone-900 border-t-2 border-stone-100 pt-3">
                              <span>{t('finance.invoice.total')}</span>
                              <span>€{selectedReceipt.amount.toLocaleString()}.00</span>
                           </div>
                        </div>
                     </div>

                     {/* 5. Footer */}
                     <div className="border-t border-stone-100 pt-6 text-center">
                        <p className="text-green-600 text-xs font-bold flex items-center justify-center gap-1 mb-2">
                           <CheckCircle2 className="w-3 h-3" /> {t('finance.invoice.paymentMethod')} {translatePaymentMethod(selectedReceipt.paymentMethod)}
                        </p>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest">
                           {t('finance.invoice.footer')} • {APP_CONFIG.appName}
                        </p>
                     </div>
                  </div>

                  {/* Actions Toolbar (Hidden on Print) */}
                  <div className="bg-stone-50 p-4 border-t border-stone-200 flex gap-3 print:hidden no-print">
                     <button
                        onClick={() => setIsReceiptOpen(false)}
                        className="flex-1 py-3 bg-white border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 hover:text-stone-800 rounded-xl text-sm transition-colors"
                     >
                        {t('finance.invoice.close')}
                     </button>
                     <button
                        onClick={handleOpenGenerateModal}
                        className="flex-[2] py-3 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-700 shadow-sm flex items-center justify-center gap-2 text-sm"
                     >
                        <Share2 className="w-4 h-4" /> {t('finance.invoice.print')}
                     </button>
                  </div>

                  {/* Close X (Absolute) */}
                  <button
                     onClick={() => setIsReceiptOpen(false)}
                     className="absolute top-4 right-4 p-2 bg-stone-100 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors print:hidden no-print"
                  >
                     <X className="w-5 h-5" />
                  </button>
               </div>
            </div>
         )}

         {/* --- GENERATE DOCUMENT MODAL (New) --- */}
         {isGenerateModalOpen && selectedReceipt && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
               <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50 rounded-t-2xl">
                     <div>
                        <h2 className="font-serif font-bold text-lg text-stone-800">{t('finance.generate.title')}</h2>
                        <p className="text-xs text-stone-500">{t('finance.generate.for')} <span className="font-bold">{getClientName(selectedReceipt.description)}</span></p>
                     </div>
                     <button onClick={() => setIsGenerateModalOpen(false)}><X className="w-5 h-5 text-stone-400" /></button>
                  </div>
                  <div className="p-6 grid gap-4">
                     {/* Email Input Field */}
                     <div>
                        <label className="text-xs font-bold uppercase text-stone-500 block mb-1">Recipient Email</label>
                        <input
                           type="email"
                           value={recipientEmail}
                           onChange={(e) => setRecipientEmail(e.target.value)}
                           placeholder="client@example.com"
                           className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-800"
                        />
                     </div>

                     {/* 1. Print / PDF */}
                     <button
                        onClick={handleActualPrint}
                        className="flex items-center gap-4 p-4 border border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all text-left group"
                     >
                        <div className="p-3 bg-stone-100 rounded-full text-stone-600 group-hover:bg-white group-hover:shadow-sm">
                           <Printer className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="font-bold text-stone-800 text-sm">{t('finance.generate.printTitle')}</h3>
                           <p className="text-xs text-stone-400">{t('finance.generate.printDesc')}</p>
                        </div>
                     </button>

                     {/* 2. Email */}
                     <button
                        onClick={handleEmailReceipt}
                        className="flex items-center gap-4 p-4 border border-stone-200 rounded-xl hover:bg-gold-50 hover:border-gold-200 transition-all text-left group"
                     >
                        <div className="p-3 bg-gold-50 rounded-full text-gold-600 group-hover:bg-white group-hover:shadow-sm">
                           <Send className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="font-bold text-stone-800 text-sm">{t('finance.generate.emailTitle')}</h3>
                           <p className="text-xs text-stone-400">{t('finance.generate.emailDesc')}</p>
                        </div>
                     </button>

                     {/* 3. WhatsApp */}
                     <button
                        onClick={handleWhatsAppReceipt}
                        className="flex items-center gap-4 p-4 border border-stone-200 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all text-left group"
                     >
                        <div className="p-3 bg-green-50 rounded-full text-green-600 group-hover:bg-white group-hover:shadow-sm">
                           <MessageCircle className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="font-bold text-stone-800 text-sm">{t('finance.generate.waTitle')}</h3>
                           <p className="text-xs text-stone-400">{t('finance.generate.waDesc')}</p>
                        </div>
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* --- ADD/EDIT TRANSACTION MODAL --- */}
         {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50 rounded-t-2xl">
                     <h2 className="font-serif font-bold text-xl text-stone-800">
                        {newTx.id ? 'Edit Entry' : t('finance.newEntry')}
                     </h2>
                     <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-stone-400 hover:text-stone-600" /></button>
                  </div>

                  <div className="p-6 space-y-5">
                     {/* Type Selector */}
                     <div className="grid grid-cols-3 gap-2">
                        {['Income', 'Expense', 'Payroll'].map(type => (
                           <button
                              key={type}
                              onClick={() => setNewTx({ ...newTx, type: type as TransactionType })}
                              className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${newTx.type === type
                                 ? (type === 'Income' ? 'bg-green-500 text-white' : type === 'Expense' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white')
                                 : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                                 }`}
                           >
                              {type}
                           </button>
                        ))}
                     </div>

                     {/* Description & Category */}
                     <div>
                        <label className="text-xs font-bold uppercase text-stone-500 block mb-1">Description</label>
                        <input
                           value={newTx.description} onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                           className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-800 placeholder-stone-400"
                           placeholder={newTx.type === 'Income' ? 'e.g. Workshop Sales' : 'e.g. Rent Payment'}
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold uppercase text-stone-500 block mb-1">Amount</label>
                           <div className="relative">
                              <Euro className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
                              <input
                                 type="number"
                                 value={newTx.amount} onChange={(e) => setNewTx({ ...newTx, amount: parseFloat(e.target.value) })}
                                 className="w-full pl-9 p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-800 placeholder-stone-400"
                              />
                           </div>
                        </div>
                        <div>
                           <label className="text-xs font-bold uppercase text-stone-500 block mb-1">Category</label>
                           <select
                              value={newTx.category} onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none text-stone-800"
                           >
                              {newTx.type === 'Income' && (
                                 <>
                                    <option>Service</option>
                                    <option>Coaching</option>
                                    <option>Workshop</option>
                                    <option>Product Sales</option>
                                 </>
                              )}
                              {newTx.type === 'Expense' && (
                                 <>
                                    <option>Inventory</option>
                                    <option>Rent</option>
                                    <option>Marketing</option>
                                    <option>Utilities</option>
                                    <option>Software</option>
                                 </>
                              )}
                              {newTx.type === 'Payroll' && (
                                 <>
                                    <option>Salary</option>
                                    <option>Contractor</option>
                                    <option>Bonus</option>
                                 </>
                              )}
                           </select>
                        </div>
                     </div>

                     {/* Date & Payment Method */}
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold uppercase text-stone-500 block mb-1">Date</label>
                           <input
                              type="date"
                              value={newTx.date} onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-gold-400 text-stone-800"
                           />
                        </div>
                        <div>
                           <label className="text-xs font-bold uppercase text-stone-500 block mb-1">Method</label>
                           <select
                              value={newTx.paymentMethod} onChange={(e) => setNewTx({ ...newTx, paymentMethod: e.target.value as any })}
                              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none text-stone-800"
                           >
                              <option>Credit Card</option>
                              <option>Bank Transfer</option>
                              <option>Cash</option>
                           </select>
                        </div>
                     </div>

                     {/* Status Dropdown */}
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold uppercase text-stone-500 block mb-1">Status</label>
                           <select
                              value={newTx.status}
                              onChange={(e) => setNewTx({ ...newTx, status: e.target.value as any })}
                              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl outline-none text-stone-800 focus:border-gold-400"
                           >
                              <option value="Paid">Paid</option>
                              <option value="Pending">Pending</option>
                           </select>
                        </div>
                     </div>

                  </div>

                  <div className="p-4 border-t border-stone-100 flex justify-end gap-2 bg-stone-50 rounded-b-2xl">
                     {newTx.id && (
                        <button
                           onClick={handleDeleteTransaction}
                           className="mr-auto text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                           title="Delete Record"
                        >
                           <Trash2 className="w-5 h-5" />
                        </button>
                     )}
                     <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-stone-500 font-bold hover:bg-stone-200 rounded-lg">Cancel</button>
                     <button
                        onClick={handleSaveTransaction}
                        disabled={!newTx.description || !newTx.amount || isSaving}
                        className="px-6 py-2 bg-stone-800 text-white font-bold rounded-lg hover:bg-stone-700 shadow-md flex items-center gap-2 disabled:opacity-50"
                     >
                        {isSaving ? (
                           <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                           </>
                        ) : (
                           <>
                              <CheckCircle2 className="w-4 h-4" /> {newTx.id ? 'Update Record' : 'Save Record'}
                           </>
                        )}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
