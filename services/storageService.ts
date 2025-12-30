// Storage Service - Upload files to Supabase Storage
import { supabase, getCurrentUser } from './supabaseClient';

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name (e.g., 'logos', 'avatars', 'resources')
 * @param folder - Optional folder path within the bucket
 * @returns The public URL of the uploaded file
 */
export const uploadFile = async (
    file: File,
    bucket: string = 'logos',
    folder: string = ''
): Promise<string> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder ? folder + '/' : ''}${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (error) {
        console.error('[StorageService] Upload error:', error);
        throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    console.log('[StorageService] ☁️ File uploaded:', urlData.publicUrl);
    return urlData.publicUrl;
};

/**
 * Upload a business logo
 * @param file - Logo image file
 * @returns Public URL of the logo
 */
export const uploadLogo = async (file: File): Promise<string> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB');
    }

    return uploadFile(file, 'logos', 'business');
};

/**
 * Upload a user avatar
 * @param file - Avatar image file
 * @returns Public URL of the avatar
 */
export const uploadAvatar = async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
    }

    if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB');
    }

    return uploadFile(file, 'avatars', '');
};

/**
 * Delete a file from Supabase Storage
 * @param url - The public URL of the file to delete
 * @param bucket - The storage bucket name
 */
export const deleteFile = async (url: string, bucket: string): Promise<void> => {
    // Extract path from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${bucket}/`);
    if (pathParts.length < 2) return;

    const filePath = pathParts[1];

    const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

    if (error) {
        console.error('[StorageService] Delete error:', error);
        throw error;
    }

    console.log('[StorageService] ☁️ File deleted');
};
