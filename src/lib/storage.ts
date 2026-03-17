import { supabase } from './supabase';

/**
 * PUMZIKA STORAGE HELPER
 * 
 * Handles property image uploads and naming conventions.
 */

const BUCKET_NAME = 'property-images';

export const uploadListingImage = async (
    listingId: string,
    file: File,
    isPrimary: boolean = false
) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${listingId}/${Date.now()}.${fileExt}`;

    const { data, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

    // If upload successful, we usually also insert into listing_images table
    const { error: dbError } = await supabase
        .from('listing_images')
        .insert({
            listing_id: listingId,
            url: publicUrl,
            is_primary: isPrimary
        });

    if (dbError) {
        throw dbError;
    }

    return publicUrl;
};

export const deleteListingImage = async (imageUrl: string, imageId: string) => {
    // Extract path from URL
    const path = imageUrl.split(`${BUCKET_NAME}/`)[1];

    if (path) {
        await supabase.storage.from(BUCKET_NAME).remove([path]);
    }

    const { error } = await supabase
        .from('listing_images')
        .delete()
        .eq('id', imageId);

    if (error) throw error;
};

export const uploadAvatar = async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

    const { error: dbError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

    if (dbError) throw dbError;

    return publicUrl;
};
