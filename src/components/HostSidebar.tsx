import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    Home,
    Calendar as CalendarIcon,
    MessageSquare,
    DollarSign,
    Star,
    Settings,
    ArrowLeft,
    Menu,
    X,
    User
} from 'lucide-react';
import { BaobabLogo } from '@/components/BaobabLogo';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const navLinks = [
    { label: 'Overview', href: '/host-dashboard', icon: BarChart3 },
    { label: 'My Listings', href: '/host-dashboard/listings', icon: Home },
    { label: 'Bookings', href: '/host-dashboard/bookings', icon: CalendarIcon },
    { label: 'Messages', href: '/host-dashboard/messages', icon: MessageSquare, badge: 3 },
    { label: 'Earnings', href: '/host-dashboard/earnings', icon: DollarSign },
    { label: 'Reviews', href: '/host-dashboard/reviews', icon: Star },
    { label: 'Calendar', href: '/host-dashboard/calendar', icon: CalendarIcon },
    { label: 'Settings', href: '/host-dashboard/settings', icon: Settings },
];

export const HostSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-[#1A6B4A] text-white">
            {/* Top: Logo */}
            <div className="p-6">
                <Link to="/" className="flex items-center gap-2">
                    <BaobabLogo className="h-8 w-8 fill-white" />
                    <span className="font-display text-xl font-bold tracking-tight">pumzika</span>
                </Link>
            </div>

            <Separator className="bg-white/10" />

            {/* Profile Section */}
            <div className="flex items-center gap-3 p-6">
                <Avatar className="h-12 w-12 border-2 border-white/20">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-white/10 text-white">
                        <User size={24} />
                    </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <p className="truncate font-semibold">Tanzania Host</p>
                    <Badge variant="secondary" className="mt-1 bg-[#E8A838] text-[#1A6B4A] hover:bg-[#E8A838]/90">
                        Superhost
                    </Badge>
                </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Nav Links */}
            <nav className="flex-1 space-y-1 p-4">
                {navLinks.map((link) => {
                    const isActive = location.pathname === link.href;
                    return (
                        <Link
                            key={link.label}
                            to={link.href}
                            className={cn(
                                "group flex items-center justify-between rounded-full px-4 py-3 text-sm font-medium transition-all hover:bg-white/10",
                                isActive ? "bg-white/15 text-white font-bold border-l-[3px] border-[#E8A838]" : "text-white/70"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <link.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive ? "text-[#E8A838]" : "text-white/60")} />
                                <span>{link.label}</span>
                            </div>
                            {link.badge && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8A838] text-[10px] text-[#1A6B4A]">
                                    {link.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Links */}
            <div className="p-4 space-y-1">
                <Link to="/" className="flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all">
                    <ArrowLeft size={18} />
                    <span>Back to Pumzika</span>
                </Link>
                <Link to="/help" className="flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-[10px]">?</span>
                    <span>Get Help</span>
                </Link>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Trigger */}
            <div className="fixed left-4 top-4 z-50 md:hidden">
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className="rounded-full shadow-lg bg-[#1A6B4A] text-white hover:bg-[#1A6B4A]/90"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </Button>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden h-screen w-[260px] flex-shrink-0 border-r border-white/10 bg-[#1A6B4A] md:fixed md:inset-y-0 md:flex md:flex-col overflow-y-auto scrollbar-hide">
                <SidebarContent />
            </aside>

            {/* Mobile Drawer Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[#1A6B4A] md:hidden shadow-2xl"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
