import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { MessageSquare, Search, Send, Loader2, ArrowLeft, MoreHorizontal, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/Footer'; // Added import for Footer

export const Inbox = ({ isDashboard = false }: { isDashboard?: boolean }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConv, setSelectedConv] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMobileView, setIsMobileView] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }
            setCurrentUser(user);
            fetchConversations(user.id);

            // Subscribe to real-time conversation updates (for unread markers/last message)
            const channel = supabase
                .channel('conversation_updates')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'conversations',
                    filter: `host_id=eq.${user.id}`
                }, () => {
                    fetchConversations(user.id);
                })
                .subscribe();

            return channel;
        };

        let activeChannel: any;
        checkUser().then(channel => { activeChannel = channel; });

        // Responsive handling
        const checkMobile = () => setIsMobileView(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
            if (activeChannel) supabase.removeChannel(activeChannel);
        };
    }, []);

    useEffect(() => {
        if (selectedConv) {
            fetchMessages(selectedConv.id);
            subscribeToMessages(selectedConv.id);
            scrollToBottom();
        }
    }, [selectedConv]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Handle direct navigation via ?conv=ID or ?conv=new
        const convId = searchParams.get('conv');
        const guestId = searchParams.get('guest');
        const hostId = searchParams.get('host');
        const listingId = searchParams.get('listing');
        const bookingId = searchParams.get('booking');

        if (convId === 'new' && (guestId || hostId) && currentUser) {
            handleNewConversation(guestId, hostId, listingId, bookingId);
        } else if (convId && conversations.length > 0) {
            const found = conversations.find(c => c.id === convId);
            if (found) setSelectedConv(found);
        } else if (conversations.length > 0 && !selectedConv && !isMobileView) {
            // Select first conversation by default on desktop
            setSelectedConv(conversations[0]);
        }
    }, [searchParams, conversations, currentUser]);

    const handleNewConversation = async (guestId: string | null, hostId: string | null, listingId: string | null, bookingId: string | null) => {
        if (!currentUser) return;

        // Determine final guest and host IDs
        const finalGuestId = guestId || currentUser.id;
        const finalHostId = hostId || currentUser.id;

        // Prevent messaging self
        if (finalGuestId === finalHostId) return;

        try {
            // Check if conversation already exists
            const { data: existing } = await supabase
                .from('conversations')
                .select('*')
                .eq('guest_id', finalGuestId)
                .eq('host_id', finalHostId)
                .maybeSingle();

            if (existing) {
                setSelectedConv(existing);
                return;
            }

            // Create new conversation
            const { data: newConv, error } = await supabase
                .from('conversations')
                .insert({
                    guest_id: finalGuestId,
                    host_id: finalHostId,
                    listing_id: listingId,
                    booking_id: bookingId,
                    last_message_at: new Date().toISOString(),
                    is_read_host: currentUser.id === finalHostId,
                    is_read_guest: currentUser.id === finalGuestId
                })
                .select(`
                    *,
                    participants:conversation_participants (
                        user:users (*)
                    ),
                    booking:bookings (
                        listing:listings (title, region)
                    )
                `)
                .single();

            if (error) throw error;
            if (newConv) {
                setConversations(prev => [newConv, ...prev]);
                setSelectedConv(newConv);
            }
        } catch (error) {
            console.error('New conversation error:', error);
            toast.error('Could not start conversation');
        }
    };

    const fetchConversations = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    participants:conversation_participants (
                        user:users (*)
                    ),
                    booking:bookings (
                        listing:listings (title, region)
                    )
                `)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setConversations(data || []);
        } catch (error) {
            console.error('Fetch conversations error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (convId: string) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true });

        if (error) console.error(error);
        else setMessages(data || []);
    };

    const subscribeToMessages = (convId: string) => {
        const channel = supabase
            .channel(`conv:${convId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${convId}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new]);
                // Mark as read if currently viewed
                if (payload.new.sender_id !== currentUser?.id) {
                    markAsRead(convId);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const markAsRead = async (convId: string) => {
        if (!currentUser) return;

        await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', convId)
            .neq('sender_id', currentUser.id);

        // Update conversation read status
        const isHost = conversations.find(c => c.id === convId)?.host_id === currentUser.id;
        const updateData = isHost ? { is_read_host: true } : { is_read_guest: true };

        await supabase
            .from('conversations')
            .update(updateData)
            .eq('id', convId);
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !selectedConv || !currentUser) return;

        const content = newMessage;
        setNewMessage('');

        try {
            const { error: msgError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: selectedConv.id,
                    sender_id: currentUser.id,
                    content
                });

            if (msgError) throw msgError;

            // Update conversation preview and unread status for recipient
            const isHost = selectedConv.host_id === currentUser.id;
            const updateData = isHost
                ? { last_message: content, updated_at: new Date().toISOString(), is_read_guest: false }
                : { last_message: content, updated_at: new Date().toISOString(), is_read_host: false };

            await supabase
                .from('conversations')
                .update(updateData)
                .eq('id', selectedConv.id);

            // Refresh local state for preview immediately for snappiness
            setConversations(prev => prev.map(c =>
                c.id === selectedConv.id
                    ? { ...c, last_message: content, updated_at: new Date().toISOString(), is_read_host: isHost, is_read_guest: !isHost }
                    : c
            ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    const getOtherParticipant = (conv: any) => {
        return conv.participants?.find((p: any) => p.user?.id !== currentUser?.id)?.user;
    };

    return (
        <div className={cn("min-h-screen bg-white", !isDashboard && "pb-20 md:pb-0")}>
            {!isDashboard && <Navbar />}

            <main className={cn(
                "container max-w-7xl px-0 md:px-4",
                isDashboard ? "pt-0" : "pt-4 md:pt-8",
                "h-[calc(100vh-100px)]" // Kept original height calculation
            )}>
                <div className="flex h-full border border-border rounded-[32px] overflow-hidden bg-card shadow-2xl">
                    {/* Sidebar */}
                    <div className={`${isMobileView && selectedConv ? 'hidden' : 'flex'} w-full md:w-[380px] border-r border-border flex flex-col bg-slate-50/50`}>
                        <div className="p-6 border-b border-border space-y-4 bg-white">
                            <h1 className="text-3xl font-display font-bold text-[#1A6B4A]">Messages</h1>
                            <div className="relative">
                                <Search size={18} className="absolute left-4 top-3 text-muted-foreground" />
                                <Input placeholder="Search your chats" className="pl-11 h-12 rounded-2xl border-none bg-slate-100 focus-visible:ring-1 focus-visible:ring-[#1A6B4A]/30" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                            ) : conversations.length > 0 ? (
                                conversations.map((conv) => {
                                    const otherUser = getOtherParticipant(conv);
                                    if (!otherUser) return null;
                                    const isSelected = selectedConv?.id === conv.id;

                                    return (
                                        <div
                                            key={conv.id}
                                            onClick={() => setSelectedConv(conv)}
                                            className={`p-6 flex gap-4 hover:bg-white cursor-pointer transition-all border-b border-border/40 ${isSelected ? 'bg-white shadow-[inset_4px_0_0_0_#1A6B4A]' : ''}`}
                                        >
                                            <div className="relative shrink-0">
                                                <img
                                                    src={otherUser.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                                                    className="h-14 w-14 rounded-2xl border-2 border-white shadow-sm object-cover"
                                                />
                                                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className={`font-bold truncate ${isSelected ? 'text-[#1A6B4A]' : 'text-foreground'}`}>{otherUser.full_name}</p>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{conv.updated_at && format(new Date(conv.updated_at), 'HH:mm')}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-semibold text-[#E8A838] truncate uppercase tracking-wider mb-1">
                                                            {conv.booking?.listing?.title || 'Direct Chat'}
                                                        </p>
                                                        <p className={cn("text-sm truncate line-clamp-1",
                                                            conv.is_read_host ? "text-muted-foreground" : "text-foreground font-bold"
                                                        )}>
                                                            {conv.last_message || 'Start a conversation'}
                                                        </p>
                                                    </div>
                                                    {!conv.is_read_host && (
                                                        <div className="h-2 w-2 rounded-full bg-[#1A6B4A] shrink-0" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-10 text-center text-muted-foreground">
                                    <p>No conversations yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className={`${isMobileView && !selectedConv ? 'hidden' : 'flex'} flex-1 flex-col bg-white relative`}>
                        {selectedConv ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 md:p-6 border-b border-border flex items-center justify-between bg-white z-10 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        {isMobileView && (
                                            <Button variant="ghost" size="icon" onClick={() => setSelectedConv(null)} className="rounded-full">
                                                <ArrowLeft size={20} />
                                            </Button>
                                        )}
                                        <img
                                            src={getOtherParticipant(selectedConv)?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                                            className="h-10 w-10 md:h-12 md:w-12 rounded-xl object-cover"
                                        />
                                        <div>
                                            <p className="font-bold text-base text-[#1A6B4A]">{getOtherParticipant(selectedConv)?.full_name}</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Active Now</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="hidden lg:flex flex-col items-end">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Property</p>
                                            <p className="text-xs font-bold text-[#1A6B4A]">
                                                {selectedConv.booking?.listing?.title || 'General Inquiry'}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal size={20} /></Button>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar">
                                    <AnimatePresence initial={false}>
                                        {messages.map((msg) => {
                                            const isMe = msg.sender_id === currentUser?.id;
                                            return (
                                                <motion.div
                                                    key={msg.id}
                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[75%] md:max-w-[60%] rounded-[24px] px-5 py-3 shadow-sm ${isMe
                                                        ? 'bg-[#1A6B4A] text-white rounded-tr-none'
                                                        : 'bg-white text-foreground border border-border/50 rounded-tl-none'
                                                        }`}>
                                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                                        <p className={`text-[9px] mt-1.5 font-bold uppercase ${isMe ? 'text-white/60' : 'text-muted-foreground'}`}>
                                                            {format(new Date(msg.created_at), 'HH:mm')}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 md:p-8 bg-white border-t border-border">
                                    <form onSubmit={handleSendMessage} className="flex gap-4 items-center max-w-4xl mx-auto">
                                        <Input
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 h-14 rounded-[20px] bg-slate-100 border-none px-6 focus-visible:ring-1 focus-visible:ring-[#1A6B4A]/40"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="h-14 w-14 rounded-[20px] bg-[#E8A838] text-[#1A6B4A] hover:bg-[#E8A838]/90 shadow-lg shadow-[#E8A838]/20 group"
                                        >
                                            <Send size={24} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </Button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col justify-center items-center text-center p-12 bg-slate-50/50">
                                <div className="h-24 w-24 bg-white rounded-[32px] shadow-xl flex items-center justify-center mb-6">
                                    <MessageSquare size={40} className="text-[#1A6B4A]" />
                                </div>
                                <h2 className="text-3xl font-display font-bold text-[#1A6B4A]">Your Inbox</h2>
                                <p className="text-muted-foreground max-w-xs mt-3 leading-relaxed">Select a conversation on the left to start chatting with hosts about your upcoming trips.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {!isDashboard && <Footer />}
            {!isDashboard && <MobileNav />}
        </div>
    );
};

export default Inbox;
