import { supabase } from './supabase';

export interface Conversation {
    id: string;
    booking_id?: string;
    last_message?: string;
    updated_at: string;
    participants?: {
        user_id: string;
        user?: {
            id: string;
            full_name: string;
            avatar_url: string;
        };
    }[];
}

export const getOrCreateConversation = async (participantIds: string[], bookingId?: string) => {
    // 1. Check if conversation already exists for these participants
    const { data: existingConvs, error: fetchError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .in('user_id', participantIds);

    if (fetchError) throw fetchError;

    // Find a conversation ID that contains ALL participants
    const convCounts: Record<string, number> = {};
    existingConvs.forEach(p => {
        convCounts[p.conversation_id] = (convCounts[p.conversation_id] || 0) + 1;
    });

    const matchingConvId = Object.keys(convCounts).find(id => convCounts[id] === participantIds.length);

    if (matchingConvId) {
        return matchingConvId;
    }

    // 2. Create new conversation if not found
    const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
            booking_id: bookingId,
            metadata: { type: 'p2p' }
        })
        .select()
        .single();

    if (convError) throw convError;

    // 3. Add participants
    const participants = participantIds.map(uid => ({
        conversation_id: newConv.id,
        user_id: uid
    }));

    const { error: partError } = await supabase
        .from('conversation_participants')
        .insert(participants);

    if (partError) throw partError;

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

    // Update conversation's last_message and timestamp
    await supabase
        .from('conversations')
        .update({
            last_message: content,
            updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

    return data;
};
