import { useNotifications } from '@/context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Bell,
    CalendarCheck,
    CalendarX,
    MessageSquare,
    Star,
    Info,
    CheckCheck,
    X,
    Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
    booking_new: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    booking_confirmed: { icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    booking_cancelled: { icon: CalendarX, color: 'text-red-500', bg: 'bg-red-50' },
    message_new: { icon: MessageSquare, color: 'text-[#1A6B4A]', bg: 'bg-[#1A6B4A]/5' },
    review_new: { icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
    system: { icon: Info, color: 'text-slate-600', bg: 'bg-slate-50' },
};

const getTypeConfig = (type: string) =>
    typeConfig[type] || typeConfig.system;

export const NotificationPanel = () => {
    const { notifications, unreadCount, isOpen, setIsOpen, markAsRead, markAllAsRead } = useNotifications();
    const navigate = useNavigate();

    const handleClick = async (notif: any) => {
        if (!notif.is_read) await markAsRead(notif.id);

        // Navigate based on notification type and data
        const data = notif.data || {};
        switch (notif.type) {
            case 'booking_new':
            case 'booking_confirmed':
            case 'booking_cancelled':
                navigate(data.is_host ? '/host-dashboard/bookings' : '/trips');
                break;
            case 'message_new':
                navigate(data.conversation_id ? `/inbox?conv=${data.conversation_id}` : '/inbox');
                break;
            case 'review_new':
                navigate(data.is_host ? '/host-dashboard/reviews' : '/trips');
                break;
            default:
                break;
        }
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.97 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.97 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed right-3 top-16 md:right-6 md:top-20 z-[70] w-[92vw] max-w-[420px] max-h-[80vh] bg-white rounded-[24px] shadow-2xl border border-border/50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 pb-4 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-[#1A6B4A] flex items-center justify-center">
                                    <Bell size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1A6B4A] text-base">Notifications</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={markAllAsRead}
                                        className="h-8 text-[10px] font-bold text-[#1A6B4A] hover:bg-[#1A6B4A]/5 rounded-full px-3"
                                    >
                                        <CheckCheck size={14} className="mr-1" /> Mark all read
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8 rounded-full text-muted-foreground"
                                >
                                    <X size={16} />
                                </Button>
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                    <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                                        <Bell size={28} className="text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-semibold text-muted-foreground">No notifications yet</p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">
                                        You'll see booking updates, messages, and reviews here.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/30">
                                    {notifications.map((notif) => {
                                        const config = getTypeConfig(notif.type);
                                        const Icon = config.icon;
                                        return (
                                            <button
                                                key={notif.id}
                                                onClick={() => handleClick(notif)}
                                                className={`w-full text-left p-4 flex gap-3 transition-all hover:bg-slate-50/80 ${!notif.is_read ? 'bg-[#1A6B4A]/[0.02]' : ''
                                                    }`}
                                            >
                                                <div className={`h-10 w-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                                                    <Icon size={18} className={config.color} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-sm leading-snug ${!notif.is_read ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                                                            {notif.title}
                                                        </p>
                                                        {!notif.is_read && (
                                                            <div className="h-2 w-2 rounded-full bg-[#1A6B4A] shrink-0 mt-1.5" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.body}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground/60 mt-1.5 uppercase tracking-wider">
                                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
