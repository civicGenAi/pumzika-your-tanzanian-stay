import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Home,
    CreditCard,
    MessageSquare,
    Settings,
    LogOut,
    ShieldAlert,
    Menu,
    X,
    Bell,
    Search as SearchIcon,
    ChevronDown,
    TrendingUp,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BaobabLogo } from '@/components/BaobabLogo';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sub-pages
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminListings from './admin/AdminListings';
import AdminBookings from './admin/AdminBookings';
import AdminReviews from './admin/AdminReviews';
import AdminSettings from './admin/AdminSettings';
import AdminReports from './admin/AdminReports';

export const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/');
                return;
            }

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error || data?.role !== 'admin') {
                toast.error('Unauthorized access');
                navigate('/');
            } else {
                setIsAdmin(true);
                setUser(data);
            }
        };

        checkAdmin();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    if (isAdmin === null) {
        return <div className="min-h-screen flex items-center justify-center bg-muted/20">Loading...</div>;
    }

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Listings', href: '/admin/listings', icon: Home },
        { name: 'Bookings', href: '/admin/bookings', icon: CreditCard },
        { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
        { name: 'Reports', href: '/admin/reports', icon: TrendingUp },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
            {/* Mobile Sidebar Toggle */}
            <div className="md:hidden flex items-center justify-between bg-card border-b p-4">
                <BaobabLogo className="scale-75 origin-left" />
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out md:static md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b flex items-center justify-between">
                        <Link to="/admin" onClick={() => setIsSidebarOpen(false)}>
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="text-primary" size={24} />
                                <span className="font-display font-bold text-xl text-[#1A6B4A]">Admin</span>
                            </div>
                        </Link>
                        <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
                            <X size={20} className="text-muted-foreground" />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/admin');
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                        }
                                    `}
                                >
                                    <item.icon size={18} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t bg-muted/30">
                        <div className="flex items-center gap-3 px-2 py-2">
                            <Avatar className="h-9 w-9 border border-border">
                                <AvatarImage src={user?.avatar_url} />
                                <AvatarFallback className="bg-primary/5 text-primary">
                                    {user?.full_name?.charAt(0) || user?.email?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate text-foreground">{user?.full_name || 'Admin'}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="hidden md:block text-lg font-semibold text-foreground capitalize">
                            {location.pathname.split('/').pop() || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Search bar placeholder */}
                        <div className="hidden lg:flex items-center relative group">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Global search..."
                                className="bg-muted/50 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary w-64 transition-all"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="p-2 text-muted-foreground hover:bg-secondary rounded-full relative transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full border-2 border-card" />
                        </button>

                        <div className="h-6 w-[1px] bg-border mx-1 hidden md:block" />

                        {/* Profile Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 p-1 pl-2 hover:bg-secondary rounded-full transition-colors outline-none">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-semibold leading-tight">{user?.full_name?.split(' ')[0]}</p>
                                        <p className="text-[10px] text-muted-foreground leading-tight">Administrator</p>
                                    </div>
                                    <Avatar className="h-8 w-8 border border-border">
                                        <AvatarImage src={user?.avatar_url} />
                                        <AvatarFallback className="bg-primary/5 text-primary text-[10px]">
                                            {user?.full_name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown size={14} className="text-muted-foreground" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl mt-2">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/')}>
                                    Target Platform
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-muted/5">
                    <div className="max-w-[1600px] mx-auto p-4 md:p-8">
                        <Routes>
                            <Route path="/" element={<AdminDashboard />} />
                            <Route path="/users" element={<AdminUsers />} />
                            <Route path="/listings" element={<AdminListings />} />
                            <Route path="/bookings" element={<AdminBookings />} />
                            <Route path="/reviews" element={<AdminReviews />} />
                            <Route path="/reports" element={<AdminReports />} />
                            <Route path="/settings" element={<AdminSettings />} />
                        </Routes>
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
