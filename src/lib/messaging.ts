import { supabase } from './supabase';

export interface Conversation {
    id: string;
    listing_id?: string;
    booking_id?: string;
    guest_id: string;
    host_id: string;
    last_message?: string;
    last_message_at: string;
    is_read_guest: boolean;
    is_read_host: boolean;
    guest?: {
        full_name: string;
        avatar_url: string;
    };
    host?: {
        full_name: string;
        avatar_url: string;
    };
}

export const getOrCreateConversation = async (guestId: string, hostId: string, listingId?: string, bookingId?: string) => {
    // 1. Check if conversation already exists between these two users
    const { data: existing, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('guest_id', guestId)
        .eq('host_id', hostId)
        .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
        return existing.id;
    }

    // 2. Create new conversation
    const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
            guest_id: guestId,
            host_id: hostId,
            listing_id: listingId || null,
            booking_id: bookingId || null,
            last_message_at: new Date().toISOString()
        })
        .select()
        .single();

    if (convError) throw convError;

    return newConv.id;
};

export const sendMessage = async (conversationId: string, senderId: string, content: string) => {
    const { data, error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: senderId,
            content
        })
        .select()
        .single();

    if (error) throw error;

    // Determine if sender is host or guest to flag the other side as unread
    const { data: conv } = await supabase
        .from('conversations')
        .select('guest_id, host_id')
        .eq('id', conversationId)
        .single();

    const isHost = conv?.host_id === senderId;
    const updateData = isHost
        ? { last_message: content, last_message_at: new Date().toISOString(), is_read_guest: false }
        : { last_message: content, last_message_at: new Date().toISOString(), is_read_host: false };

    await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId);

    return data;
};
