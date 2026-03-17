import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Shield, Bell, CreditCard, HelpCircle, LogOut, ChevronRight, Loader2, Camera, MapPin, Languages, CheckCircle2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
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
        <div className="min-h-screen bg-[#F7F7F7] pb-20 md:pb-0">
            <Navbar />
            <main className="container pt-10 pb-16">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl font-bold mb-10 text-[#1A6B4A]">Account Settings</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Profile Summary Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-border sticky top-24">
                                <div className="flex flex-col items-center text-center">
                                    <div
                                        className="relative group cursor-pointer h-32 w-32 rounded-full mb-6 ring-4 ring-[#1A6B4A]/5 ring-offset-4 overflow-hidden"
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

                                    <h2 className="text-2xl font-bold text-[#1A6B4A]">{profile?.full_name}</h2>
                                    <p className="text-muted-foreground mb-6 font-medium">{profile?.email}</p>

                                    <div className="w-full space-y-4 text-left border-t border-border pt-6">
                                        <div className="flex items-center gap-3 text-sm font-medium">
                                            <CheckCircle2 size={18} className="text-[#1A6B4A]" />
                                            Identity verified
                                        </div>
                                        {profile?.bio && (
                                            <p className="text-sm text-muted-foreground line-clamp-3 italic">"{profile.bio}"</p>
                                        )}
                                        {profile?.languages?.length > 0 && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Languages size={18} className="text-[#E8A838]" />
                                                <span>Speaks {profile.languages.join(', ')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings Menu Grid */}
                        <div className="lg:col-span-2">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {menuItems.map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={item.onClick}
                                        className="flex flex-col gap-4 p-6 bg-white border border-border rounded-3xl hover:shadow-lg hover:border-transparent transition-all text-left group"
                                    >
                                        <div className="h-12 w-12 bg-[#1A6B4A]/10 rounded-2xl flex items-center justify-center text-[#1A6B4A] group-hover:bg-[#1A6B4A] group-hover:text-white transition-all duration-300">
                                            <item.icon size={24} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-[#1A6B4A]">{item.label}</h3>
                                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-12 flex items-center justify-between p-8 bg-[#FFF4F2] rounded-[32px] border border-destructive/10">
                                <div>
                                    <h3 className="font-bold text-destructive text-lg">Sign out of your account</h3>
                                    <p className="text-sm text-destructive/70">Safety first! Securely logout from your session.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="rounded-full px-8 py-6 h-auto font-bold border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all"
                                    onClick={handleLogout}
                                >
                                    Log out
                                </Button>
                            </div>
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
