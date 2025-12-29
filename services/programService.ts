import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { Program } from '../types';

// ==============================================
// LUMINA EMPIRE - Program Service
// Handles all program/service CRUD operations with Supabase
// Database table: 'services'
// ==============================================

interface SupabaseServiceRow {
    id: string;
    coach_id: string;
    name: string;
    description: string | null;
    type: string | null;
    category: string | null;
    price: number;
    duration_minutes: number | null;
    is_active: boolean;
    is_bookable_online: boolean;
    total_bookings: number;
    total_revenue: number;
    created_at: string;
    updated_at: string;
}

// ==============================================
// Helper: Convert Frontend Program to DB format
// ==============================================
const programToRow = (program: Partial<Program>, coachId: string): Partial<SupabaseServiceRow> => {
    const row: Partial<SupabaseServiceRow> = {
        coach_id: coachId
    };

    if (program.title !== undefined) row.name = program.title;
    if (program.category !== undefined) row.category = program.category;
    if (program.type !== undefined) row.type = program.type;
    if (program.price !== undefined) row.price = program.price;
    if (program.durationMinutes !== undefined) row.duration_minutes = program.durationMinutes;
    if (program.active !== undefined) row.is_active = program.active;

    return row;
};

// ==============================================
// Helper: Convert DB row to Frontend Program
// ==============================================
const rowToProgram = (row: SupabaseServiceRow): Program => {
    return {
        id: row.id,
        title: row.name,
        category: row.category as 'Coaching' | 'Holistic' || 'Coaching',
        type: row.type as any || '1:1 Coaching',
        durationMinutes: row.duration_minutes || 60,
        price: Number(row.price) || 0,
        active: row.is_active
    };
};

// ==============================================
// GET: Fetch all programs for current coach
// ==============================================
export const getPrograms = async (): Promise<Program[]> => {
    if (!isSupabaseConfigured()) {
        console.warn('📴 Supabase not configured - returning empty array');
        return [];
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ Error fetching programs:', error);
        throw error;
    }

    return (data || []).map(rowToProgram);
};

// ==============================================
// CREATE: Add new program
// ==============================================
export const createProgram = async (program: Omit<Program, 'id'>): Promise<Program> => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const row = programToRow(program, user.id);

    const { data, error } = await supabase
        .from('services')
        .insert(row)
        .select()
        .single();

    if (error) {
        console.error('❌ Error creating program:', error);
        throw error;
    }

    return rowToProgram(data);
};

// ==============================================
// UPDATE: Update existing program
// ==============================================
export const updateProgram = async (programId: string, updates: Partial<Program>): Promise<Program> => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const row = programToRow(updates, user.id);
    delete row.coach_id;

    const { data, error } = await supabase
        .from('services')
        .update(row)
        .eq('id', programId)
        .eq('coach_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('❌ Error updating program:', error);
        throw error;
    }

    return rowToProgram(data);
};

// ==============================================
// DELETE: Remove program
// ==============================================
export const deleteProgram = async (programId: string): Promise<void> => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', programId)
        .eq('coach_id', user.id);

    if (error) {
        console.error('❌ Error deleting program:', error);
        throw error;
    }
};

export default {
    getPrograms,
    createProgram,
    updateProgram,
    deleteProgram
};
