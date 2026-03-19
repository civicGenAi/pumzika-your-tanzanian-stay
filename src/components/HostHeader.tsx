import { useState, useEffect } from 'react';
import { Bell, User, LogOut, Settings, HelpCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { useNotifications } from '@/context/NotificationContext';

export const HostHeader = () => {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const navigate = useNavigate();
    const { unreadCount, setIsOpen: setNotifOpen } = useNotifications();

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                fetchProfile(session.user.id);
            }
        };
        getSession();
    }, []);

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        if (data) setProfile(data);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success('Logged out successfully');
        navigate('/');
    };

    const getInitials = (name: string) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return parts[0][0].toUpperCase();
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-white/80 px-4 backdrop-blur-md md:px-8">
            <div className="flex items-center gap-4">
                {/* Search or Page Title could go here in future */}
                <h1 className="hidden text-sm font-semibold text-muted-foreground md:block">
                    Host Mode
                </h1>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
                {/* Notification Bell */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNotifOpen(true)}
                    className="relative h-9 w-9 rounded-full text-muted-foreground hover:bg-secondary"
                >
                    <Bell size={18} strokeWidth={2} />
                    {unreadCount > 0 && (
                        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E8A838] text-[8px] font-bold text-[#1A6B4A] ring-2 ring-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 rounded-full border border-border bg-white p-1 pr-3 transition-all hover:border-primary/20 hover:shadow-sm">
                            <Avatar className="h-8 w-8 border border-border">
                                <AvatarImage src={user?.user_metadata?.avatar_url} />
                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                    {profile ? getInitials(profile.full_name) : 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden text-left md:block">
                                <p className="text-xs font-bold text-[#1A6B4A] leading-none">{profile?.full_name || 'Host'}</p>
                                {profile?.role === 'host' && (
                                    <span className="text-[10px] font-medium text-muted-foreground">Superhost</span>
                                )}
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl border-border p-2 shadow-xl ring-0 animate-in fade-in zoom-in duration-200">
                        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem onClick={() => navigate('/host-dashboard/settings')} className="flex items-center gap-2 rounded-lg py-2 cursor-pointer hover:bg-primary/5 text-[#1A6B4A] font-medium">
                            <Settings size={16} /> Dashboard Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/profile')} className="flex items-center gap-2 rounded-lg py-2 cursor-pointer hover:bg-primary/5">
                            <User size={16} /> Personal Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/help')} className="flex items-center gap-2 rounded-lg py-2 cursor-pointer hover:bg-primary/5">
                            <HelpCircle size={16} /> Help Center
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 rounded-lg py-2 cursor-pointer text-destructive hover:bg-destructive/10">
                            <LogOut size={16} /> Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};
