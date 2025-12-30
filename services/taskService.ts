// Task Service - Supabase Cloud Storage for Dashboard Tasks
import { supabase, getCurrentUser } from './supabaseClient';

export interface Task {
    id: string;
    coach_id: string;
    client_id?: string;
    title: string;
    description?: string;
    category?: 'follow_up' | 'admin' | 'sales' | 'content';
    priority?: 'urgent' | 'normal' | 'low';
    completed: boolean;
    due_date?: string;
    created_at?: string;
}

/**
 * Helper to get current user ID
 */
const getCurrentUserId = async (): Promise<string | null> => {
    const user = await getCurrentUser();
    return user?.id || null;
};

/**
 * Get all tasks for the current coach
 */
export const getTasks = async (): Promise<Task[]> => {
    const userId = await getCurrentUserId();
    if (!userId) {
        console.warn('[TaskService] No user ID, returning empty array');
        return [];
    }

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('coach_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[TaskService] Error fetching tasks:', error);
        throw error;
    }

    return data || [];
};

/**
 * Create a new task
 */
export const createTask = async (task: Omit<Task, 'id' | 'coach_id' | 'created_at'>): Promise<Task> => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            coach_id: userId,
            title: task.title,
            description: task.description,
            category: task.category || 'admin',
            priority: task.priority || 'normal',
            completed: task.completed || false,
            due_date: task.due_date
        })
        .select()
        .single();

    if (error) {
        console.error('[TaskService] Error creating task:', error);
        throw error;
    }

    console.log('[TaskService] ☁️ Task created in Supabase');
    return data;
};

/**
 * Update a task
 */
export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('coach_id', userId)
        .select()
        .single();

    if (error) {
        console.error('[TaskService] Error updating task:', error);
        throw error;
    }

    console.log('[TaskService] ☁️ Task updated in Supabase');
    return data;
};

/**
 * Toggle task completion status
 */
export const toggleTaskCompleted = async (id: string): Promise<Task> => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // First get current state
    const { data: current, error: fetchError } = await supabase
        .from('tasks')
        .select('completed')
        .eq('id', id)
        .eq('coach_id', userId)
        .single();

    if (fetchError) throw fetchError;

    // Toggle it
    const { data, error } = await supabase
        .from('tasks')
        .update({ completed: !current.completed })
        .eq('id', id)
        .eq('coach_id', userId)
        .select()
        .single();

    if (error) {
        console.error('[TaskService] Error toggling task:', error);
        throw error;
    }

    console.log('[TaskService] ☁️ Task toggled in Supabase');
    return data;
};

/**
 * Delete a task
 */
export const deleteTask = async (id: string): Promise<void> => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('coach_id', userId);

    if (error) {
        console.error('[TaskService] Error deleting task:', error);
        throw error;
    }

    console.log('[TaskService] ☁️ Task deleted from Supabase');
};
