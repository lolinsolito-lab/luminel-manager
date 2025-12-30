import { supabase } from './supabaseClient';

export interface EmailParams {
    to: string;
    resourceTitle?: string;
    resourceUrl?: string;
    message: string;
    businessName: string;
    senderName: string;
    receiptNumber?: string;
    amount?: number;
}

/**
 * Notification Service - Handles communication with Supabase Edge Functions
 */
export const sendResourceEmail = async (params: EmailParams): Promise<any> => {
    try {
        const { data, error } = await supabase.functions.invoke('send-resource', {
            body: params,
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('[NotificationService] Error sending resource email:', error);
        throw error;
    }
};

/**
 * Local simulation for verification before push
 */
export const simulateEmailSend = async (params: EmailParams): Promise<void> => {
    console.log('[NotificationService] 📧 SIMULATING EMAIL SEND:', params);
    return new Promise(resolve => setTimeout(resolve, 1500));
};
