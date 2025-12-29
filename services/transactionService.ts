import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Transaction, TransactionType } from '../types';

// ==============================================
// LUMINA EMPIRE - Transaction Service
// Handles all financial CRUD operations with Supabase
// ==============================================

// Type for Supabase transaction row
interface SupabaseTransactionRow {
    id: string;
    coach_id: string;
    client_id: string | null;
    session_id: string | null;
    type: string;
    amount: number;
    category: string | null;
    description: string | null;
    date: string;
    status: string;
    payment_method: string | null;
    created_at: string;
}

// ==============================================
// Helper: Convert Frontend Transaction to DB format
// ==============================================
const transactionToRow = (transaction: Partial<Transaction>, coachId: string): Partial<SupabaseTransactionRow> => {
    const row: Partial<SupabaseTransactionRow> = {
        coach_id: coachId
    };

    if (transaction.type !== undefined) row.type = transaction.type.toLowerCase();
    if (transaction.amount !== undefined) row.amount = transaction.amount;
    if (transaction.category !== undefined) row.category = transaction.category;
    if (transaction.description !== undefined) row.description = transaction.description;
    if (transaction.date !== undefined) row.date = transaction.date;
    if (transaction.status !== undefined) row.status = transaction.status.toLowerCase();
    if (transaction.paymentMethod !== undefined) {
        row.payment_method = transaction.paymentMethod.toLowerCase().replace(' ', '_');
    }

    return row;
};

// ==============================================
// Helper: Convert DB row to Frontend Transaction
// ==============================================
const rowToTransaction = (row: SupabaseTransactionRow): Transaction => {
    // Map DB type to TransactionType
    const typeMap: Record<string, TransactionType> = {
        'income': 'Income',
        'expense': 'Expense',
        'payroll': 'Payroll'
    };

    // Map payment method
    const paymentMethodMap: Record<string, 'Credit Card' | 'Bank Transfer' | 'Cash'> = {
        'credit_card': 'Credit Card',
        'bank_transfer': 'Bank Transfer',
        'cash': 'Cash'
    };

    return {
        id: row.id,
        description: row.description || '',
        amount: row.amount,
        type: typeMap[row.type] || 'Income',
        category: row.category || 'Service',
        date: row.date,
        status: row.status === 'paid' ? 'Paid' : 'Pending',
        paymentMethod: row.payment_method ? paymentMethodMap[row.payment_method] : undefined
    };
};

// ==============================================
// GET: Fetch all transactions for current coach
// ==============================================
export const getTransactions = async (): Promise<Transaction[]> => {
    if (!isSupabaseConfigured()) {
        console.warn('📴 Supabase not configured');
        return [];
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('coach_id', user.id)
        .order('date', { ascending: false });

    if (error) {
        console.error('❌ Error fetching transactions:', error);
        throw error;
    }

    return (data || []).map(rowToTransaction);
};

// ==============================================
// GET: Fetch transactions for a date range
// ==============================================
export const getTransactionsByDateRange = async (startDate: string, endDate: string): Promise<Transaction[]> => {
    if (!isSupabaseConfigured()) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('coach_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(rowToTransaction);
};

// ==============================================
// GET: Fetch transactions for current month
// ==============================================
export const getTransactionsThisMonth = async (): Promise<Transaction[]> => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    return getTransactionsByDateRange(startOfMonth, endOfMonth);
};

// ==============================================
// CREATE: Record new transaction
// ==============================================
export const createTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const row = transactionToRow(transaction, user.id);
    row.status = row.status || 'pending';

    const { data, error } = await supabase
        .from('transactions')
        .insert(row)
        .select()
        .single();

    if (error) {
        console.error('❌ Error creating transaction:', error);
        throw error;
    }

    return rowToTransaction(data);
};

// ==============================================
// UPDATE: Update existing transaction
// ==============================================
export const updateTransaction = async (transactionId: string, updates: Partial<Transaction>): Promise<Transaction> => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const row = transactionToRow(updates, user.id);
    delete row.coach_id;

    const { data, error } = await supabase
        .from('transactions')
        .update(row)
        .eq('id', transactionId)
        .eq('coach_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('❌ Error updating transaction:', error);
        throw error;
    }

    return rowToTransaction(data);
};

// ==============================================
// DELETE: Remove transaction
// ==============================================
export const deleteTransaction = async (transactionId: string): Promise<void> => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('coach_id', user.id);

    if (error) {
        console.error('❌ Error deleting transaction:', error);
        throw error;
    }
};

// ==============================================
// STATS: Get financial statistics
// ==============================================
export const getFinanceStats = async (): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    revenueThisMonth: number;
    expensesThisMonth: number;
    pendingPayments: number;
}> => {
    if (!isSupabaseConfigured()) {
        return {
            totalRevenue: 0,
            totalExpenses: 0,
            netProfit: 0,
            revenueThisMonth: 0,
            expensesThisMonth: 0,
            pendingPayments: 0
        };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get all transactions
    const { data, error } = await supabase
        .from('transactions')
        .select('type, amount, date, status')
        .eq('coach_id', user.id);

    if (error) throw error;

    const transactions = data || [];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    // Calculate totals
    const totalRevenue = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense' || t.type === 'payroll')
        .reduce((sum, t) => sum + t.amount, 0);

    const revenueThisMonth = transactions
        .filter(t => t.type === 'income' && t.date >= startOfMonth)
        .reduce((sum, t) => sum + t.amount, 0);

    const expensesThisMonth = transactions
        .filter(t => (t.type === 'expense' || t.type === 'payroll') && t.date >= startOfMonth)
        .reduce((sum, t) => sum + t.amount, 0);

    const pendingPayments = transactions
        .filter(t => t.status === 'pending' && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    return {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        revenueThisMonth,
        expensesThisMonth,
        pendingPayments
    };
};

// ==============================================
// REPORTS: Get monthly breakdown
// ==============================================
export const getMonthlyBreakdown = async (year: number): Promise<{
    month: number;
    revenue: number;
    expenses: number;
}[]> => {
    if (!isSupabaseConfigured()) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('transactions')
        .select('type, amount, date')
        .eq('coach_id', user.id)
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`);

    if (error) throw error;

    // Group by month
    const months: { month: number; revenue: number; expenses: number }[] = [];
    for (let month = 0; month < 12; month++) {
        const monthStr = String(month + 1).padStart(2, '0');
        const prefix = `${year}-${monthStr}`;

        const monthTransactions = (data || []).filter(t => t.date.startsWith(prefix));

        months.push({
            month: month + 1,
            revenue: monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0),
            expenses: monthTransactions
                .filter(t => t.type === 'expense' || t.type === 'payroll')
                .reduce((sum, t) => sum + t.amount, 0)
        });
    }

    return months;
};

export default {
    getTransactions,
    getTransactionsByDateRange,
    getTransactionsThisMonth,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getFinanceStats,
    getMonthlyBreakdown
};
