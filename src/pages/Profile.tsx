import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Shield, Bell, CreditCard, HelpCircle, LogOut, ChevronRight, Loader2, Camera, MapPin, Languages, CheckCircle2, Star, Home } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { EditProfileDialog } from '@/components/EditProfileDialog';
import { SecurityDialog } from '@/components/SecurityDialog';
import { PaymentsDialog } from '@/components/PaymentsDialog';
import { NotificationsDialog } from '@/components/NotificationsDialog';
import { HelpDialog } from '@/components/HelpDialog';
import { uploadAvatar } from '@/lib/storage';

const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [securityOpen, setSecurityOpen] = useState(false);
    const [paymentsOpen, setPaymentsOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB');
            return;
        }

        setIsUploading(true);
        try {
            const publicUrl = await uploadAvatar(profile.id, file);
            setProfile({ ...profile, avatar_url: publicUrl });
            toast.success('Profile picture updated');
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success('Logged out successfully');
        navigate('/');
    };

    const menuItems = [
        {
            icon: UserIcon,
            label: 'Personal Information',
            desc: 'Manage your name, email and ID',
            onClick: () => setEditDialogOpen(true)
        },
        {
            icon: Shield,
            label: 'Login & Security',
            desc: 'Update password and secure your account',
            onClick: () => setSecurityOpen(true)
        },
        {
            icon: CreditCard,
            label: 'Payments & Payouts',
            desc: 'Review payments, payouts and taxes',
            onClick: () => setPaymentsOpen(true)
        },
        {
            icon: Bell,
            label: 'Notifications',
            desc: 'Customize what you hear from us',
            onClick: () => setNotificationsOpen(true)
        },
        {
            icon: HelpCircle,
            label: 'Legal & Help',
            desc: 'Terms of service and support',
            onClick: () => setHelpOpen(true)
        },
    ];

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#1A6B4A]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDF6EE] pb-20 md:pb-0">
            <Navbar />

            {/* Header / Hero Area */}
            <div className="bg-[#1A6B4A] pt-32 pb-48 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse" />
                <div className="container relative z-10">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">Account Hub</h1>
                    <p className="text-emerald-100/80 text-lg">Manage your profile, security, and preferences.</p>
                </div>
            </div>

            <main className="container -mt-32 pb-24 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Sidebar / Profile Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-[#1A6B4A]/5 border border-[#1A6B4A]/5">
                            <div className="flex flex-col items-center text-center">
                                <div
                                    className="relative group cursor-pointer h-32 w-32 rounded-full mb-6 ring-4 ring-[#E8A838]/20 ring-offset-4 overflow-hidden"
                                    onClick={handleAvatarClick}
                                >
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover group-hover:opacity-75 transition-opacity" />
                                    ) : (
                                        <div className="h-full w-full bg-[#1A6B4A] flex items-center justify-center text-4xl font-bold text-white group-hover:opacity-75 transition-opacity">
                                            {profile?.full_name?.charAt(0) || 'P'}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isUploading ? <Loader2 className="h-8 w-8 animate-spin text-white" /> : <Camera className="text-white" size={28} />}
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />

                                <div className="space-y-1 mb-6">
                                    <h2 className="text-2xl font-bold text-foreground">{profile?.full_name}</h2>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-medium text-muted-foreground">{profile?.email}</span>
                                        {profile?.is_verified && (
                                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0 h-5 text-[10px]">
                                                VERIFIED
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full pt-6 border-t border-border space-y-4">
                                    <div className="flex items-center justify-between text-sm px-2">
                                        <span className="text-muted-foreground flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Identity</span>
                                        <span className="font-bold text-emerald-600">Verified</span>
                                    </div>
                                    {profile?.role === 'host' && (
                                        <div className="flex items-center justify-between text-sm px-2">
                                            <span className="text-muted-foreground flex items-center gap-2"><Shield size={16} className="text-blue-500" /> Host Standing</span>
                                            <span className="font-bold text-blue-600">Premium</span>
                                        </div>
                                    )}

                                    {profile?.bio && (
                                        <div className="bg-secondary/20 p-4 rounded-2xl text-left">
                                            <p className="text-xs text-muted-foreground italic leading-relaxed">"{profile.bio}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#1A6B4A]/5">
                            <h3 className="font-bold mb-4 px-2">Quick Access</h3>
                            <div className="space-y-2">
                                <Button variant="ghost" className="w-full justify-start rounded-xl gap-3 text-muted-foreground hover:text-[#1A6B4A] hover:bg-[#1A6B4A]/5 h-12" onClick={() => navigate('/trips')}>
                                    <MapPin size={18} /> My Trips
                                </Button>
                                <Button variant="ghost" className="w-full justify-start rounded-xl gap-3 text-muted-foreground hover:text-[#1A6B4A] hover:bg-[#1A6B4A]/5 h-12" onClick={() => navigate('/saved')}>
                                    <Star size={18} /> Wishlist
                                </Button>
                                {profile?.role === 'host' && (
                                    <Button variant="ghost" className="w-full justify-start rounded-xl gap-3 text-muted-foreground hover:text-[#1A6B4A] hover:bg-[#1A6B4A]/5 h-12" onClick={() => navigate('/host-dashboard')}>
                                        <Home size={18} /> Host Dashboard
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="grid gap-6">
                            {menuItems.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={item.onClick}
                                    className="flex items-center justify-between p-6 bg-white border border-border rounded-[2rem] hover:shadow-xl hover:shadow-[#1A6B4A]/10 hover:border-emerald-200 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="h-14 w-14 bg-[#1A6B4A]/5 rounded-2xl flex items-center justify-center text-[#1A6B4A] group-hover:scale-110 transition-transform duration-300">
                                            <item.icon size={28} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-foreground group-hover:text-[#1A6B4A] transition-colors">{item.label}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center justify-between p-10 bg-gradient-to-r from-red-50 to-orange-50 rounded-[2rem] border border-red-100 shadow-sm">
                            <div className="space-y-1">
                                <h3 className="font-bold text-red-700 text-lg">Sign out</h3>
                                <p className="text-sm text-red-600/70">Need a break? You can sign out from your account here.</p>
                            </div>
                            <Button
                                variant="outline"
                                className="rounded-2xl px-8 h-12 font-bold border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                onClick={handleLogout}
                            >
                                <LogOut size={18} className="mr-2" /> Log out
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            {profile && (
                <>
                    <EditProfileDialog
                        profile={profile}
                        onUpdate={fetchProfile}
                        triggerOverride={null} // We call it via menu logic
                        externalOpen={editDialogOpen}
                        setExternalOpen={setEditDialogOpen}
                    />
                    <SecurityDialog
                        open={securityOpen}
                        onOpenChange={setSecurityOpen}
                    />
                    <PaymentsDialog
                        open={paymentsOpen}
                        onOpenChange={setPaymentsOpen}
                    />
                    <NotificationsDialog
                        open={notificationsOpen}
                        onOpenChange={setNotificationsOpen}
                    />
                    <HelpDialog
                        open={helpOpen}
                        onOpenChange={setHelpOpen}
                    />
                </>
            )}

            <Footer />
            <MobileNav />
        </div>
    );
};

export default Profile;
