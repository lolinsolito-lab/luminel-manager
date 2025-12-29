
import { TeamMember, TeamMemberStatus, TeamMemberType } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// === SUPABASE CONVERTERS ===

interface SupabaseTeamMember {
    id: string;
    user_id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string;
    type: string;
    amount: number;
    due_day: number;
    status: string;
    vat_id: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

const convertFromSupabase = (row: SupabaseTeamMember): TeamMember => ({
    id: row.id,
    name: row.name,
    email: row.email || undefined,
    phone: row.phone || undefined,
    role: row.role,
    type: row.type as TeamMemberType,
    amount: Number(row.amount),
    dueDay: row.due_day,
    status: row.status as TeamMemberStatus,
    vatId: row.vat_id || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
});

const convertToSupabase = (member: Partial<TeamMember>) => ({
    name: member.name,
    email: member.email || null,
    phone: member.phone || null,
    role: member.role,
    type: member.type,
    amount: member.amount,
    due_day: member.dueDay,
    status: member.status || 'Pending',
    vat_id: member.vatId || null,
    notes: member.notes || null,
});

// === TEAM SERVICE ===

/**
 * Get all team members
 */
export const getTeamMembers = async (): Promise<TeamMember[]> => {
    if (!isSupabaseConfigured()) {
        console.warn('[TeamService] ⚠️ Supabase not configured');
        return [];
    }

    const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name');

    if (error) {
        console.error('[TeamService] ❌ Error fetching team:', error);
        throw error;
    }

    console.log('[TeamService] ✅ Loaded', data.length, 'team members from Supabase');
    return data.map(convertFromSupabase);
};

/**
 * Get team member by ID
 */
export const getTeamMemberById = async (id: string): Promise<TeamMember | null> => {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('[TeamService] ❌ Error fetching member:', error);
        return null;
    }

    return convertFromSupabase(data);
};

/**
 * Create a new team member
 */
export const createTeamMember = async (member: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
        .from('team_members')
        .insert(convertToSupabase(member))
        .select()
        .single();

    if (error) {
        console.error('[TeamService] ❌ Error creating member:', error);
        throw error;
    }

    console.log('[TeamService] ✅ Created team member:', data.name);
    return convertFromSupabase(data);
};

/**
 * Update a team member
 */
export const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> => {
    if (!isSupabaseConfigured()) return null;

    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.dueDay !== undefined) updateData.due_day = updates.dueDay;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.vatId !== undefined) updateData.vat_id = updates.vatId;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('[TeamService] ❌ Error updating member:', error);
        return null;
    }

    console.log('[TeamService] ✅ Updated team member:', data.name);
    return convertFromSupabase(data);
};

/**
 * Delete a team member
 */
export const deleteTeamMember = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) return false;

    const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[TeamService] ❌ Error deleting member:', error);
        return false;
    }

    console.log('[TeamService] ✅ Deleted team member');
    return true;
};

/**
 * Mark a team member as paid
 */
export const markAsPaid = async (id: string): Promise<TeamMember | null> => {
    return updateTeamMember(id, { status: 'Paid' });
};

/**
 * Mark a team member as pending
 */
export const markAsPending = async (id: string): Promise<TeamMember | null> => {
    return updateTeamMember(id, { status: 'Pending' });
};

/**
 * Get team stats
 */
export const getTeamStats = async (): Promise<{
    totalMembers: number;
    salaryCount: number;
    contractorCount: number;
    totalPayroll: number;
    pendingPayments: number;
    paidPayments: number;
}> => {
    const members = await getTeamMembers();

    return {
        totalMembers: members.length,
        salaryCount: members.filter(m => m.type === 'Salary').length,
        contractorCount: members.filter(m => m.type === 'Contractor').length,
        totalPayroll: members.reduce((sum, m) => sum + m.amount, 0),
        pendingPayments: members.filter(m => m.status === 'Pending').reduce((sum, m) => sum + m.amount, 0),
        paidPayments: members.filter(m => m.status === 'Paid').reduce((sum, m) => sum + m.amount, 0),
    };
};

/**
 * Get members by type
 */
export const getTeamMembersByType = async (type: TeamMemberType): Promise<TeamMember[]> => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('type', type)
        .order('name');

    if (error) throw error;
    return data.map(convertFromSupabase);
};

/**
 * Get members by status
 */
export const getTeamMembersByStatus = async (status: TeamMemberStatus): Promise<TeamMember[]> => {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('status', status)
        .order('name');

    if (error) throw error;
    return data.map(convertFromSupabase);
};
