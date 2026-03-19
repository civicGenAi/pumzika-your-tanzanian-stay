import { useState, useEffect } from 'react';
import { User, Bell, Shield, CreditCard, HelpCircle, LogOut, Loader2, Camera, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { EditProfileDialog } from '@/components/EditProfileDialog';
import { SecurityDialog } from '@/components/SecurityDialog';
import { PaymentsDialog } from '@/components/PaymentsDialog';
import { NotificationsDialog } from '@/components/NotificationsDialog';
import { HelpDialog } from '@/components/HelpDialog';
import { uploadAvatar } from '@/lib/storage';

export const HostSettings = () => {
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Dialog/Tab states
    const [editOpen, setEditOpen] = useState(false);
    const [securityOpen, setSecurityOpen] = useState(false);
    const [paymentsOpen, setPaymentsOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load host settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const publicUrl = await uploadAvatar(profile.id, file);
            setProfile({ ...profile, avatar_url: publicUrl });
            toast.success('Host avatar updated');
        } catch (error) {
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const settingsTabs = [
        {
            id: 'profile',
            title: 'Public Profile',
            icon: User,
            desc: 'Your public info and bio',
            items: [
                {
                    label: 'Personal Information',
                    desc: 'Manage your host bio, name and phone',
                    actionLabel: 'Edit Profile',
                    onClick: () => setEditOpen(true)
                },
                {
                    label: 'Verification Status',
                    desc: 'Manage your identity and host badges',
                    actionLabel: 'Check Status',
                    onClick: () => { }
                }
            ]
        },
        {
            id: 'business',
            title: 'Hosting & Business',
            icon: CreditCard,
            desc: 'Payouts and hosting preferences',
            items: [
                {
                    label: 'Payout Methods',
                    desc: 'Where you receive your earnings',
                    actionLabel: 'Manage Payouts',
                    onClick: () => setPaymentsOpen(true)
                },
                {
                    label: 'Notifications',
                    desc: 'Control host alerts and guest messages',
                    actionLabel: 'Preferences',
                    onClick: () => setNotificationsOpen(true)
                }
            ]
        },
        {
            id: 'account',
            title: 'Account & Security',
            icon: Shield,
            desc: 'Security and login settings',
            items: [
                {
                    label: 'Login & Security',
                    desc: 'Secure your hosting account',
                    actionLabel: 'Update Security',
                    onClick: () => setSecurityOpen(true)
                },
                {
                    label: 'Legal & Help',
                    desc: 'Host terms and support resources',
                    actionLabel: 'Get Help',
                    onClick: () => setHelpOpen(true)
                }
            ]
        }
    ];

    const currentTab = settingsTabs.find(t => t.id === activeTab) || settingsTabs[0];

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#1A6B4A]" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Host Profile Header Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-border/50 flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                    <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-[#1A6B4A]/5 ring-offset-4">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-[#1A6B4A] flex items-center justify-center text-3xl font-bold text-white">
                                {profile?.full_name?.charAt(0)}
                            </div>
                        )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {isUploading ? <Loader2 className="text-white animate-spin" /> : <Camera className="text-white" size={24} />}
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                </div>

                <div className="text-center md:text-left flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <h2 className="text-2xl font-bold text-[#1A6B4A]">{profile?.full_name}</h2>
                        <CheckCircle2 size={18} className="text-[#1A6B4A]" />
                    </div>
                    <p className="text-muted-foreground font-medium">{profile?.email}</p>
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                        <span className="px-3 py-1 bg-emerald-50 text-[#1A6B4A] rounded-full text-xs font-bold uppercase tracking-wider border border-[#1A6B4A]/10">Superhost Status</span>
                        <span className="px-3 py-1 bg-[#E8A838]/10 text-[#E8A838] rounded-full text-xs font-bold uppercase tracking-wider border border-[#E8A838]/10">Identity Verified</span>
                    </div>
                </div>
            </div>

            {/* Main Settings Layout */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Side Navigation */}
                <div className="w-full lg:w-[320px] bg-white rounded-[32px] p-4 shadow-sm border border-border/50 shrink-0">
                    <div className="space-y-1">
                        {settingsTabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group",
                                        isActive ? "bg-[#1A6B4A] text-white shadow-lg" : "hover:bg-slate-50 text-slate-600"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-[#1A6B4A]/10 group-hover:text-[#1A6B4A]"
                                    )}>
                                        <tab.icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm">{tab.title}</p>
                                        <p className={cn("text-[10px] truncate uppercase tracking-widest font-medium", isActive ? "text-white/70" : "text-muted-foreground")}>
                                            {tab.id === 'profile' ? 'Public' : tab.id === 'business' ? 'Hosting' : 'Security'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 w-full space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-white rounded-[40px] p-10 shadow-sm border border-border/50">
                        <div className="mb-10">
                            <h3 className="text-2xl font-bold text-[#1A6B4A] font-display">{currentTab.title}</h3>
                            <p className="text-muted-foreground mt-1 text-sm">{currentTab.desc}</p>
                        </div>

                        <div className="space-y-4">
                            {currentTab.items.map((item, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-[#1A6B4A]/10 transition-colors">
                                    <div className="space-y-1">
                                        <p className="font-bold text-[#1A6B4A]">{item.label}</p>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </div>
                                    <Button
                                        onClick={item.onClick}
                                        variant="outline"
                                        className="rounded-full border-[#1A6B4A]/20 text-[#1A6B4A] hover:bg-[#1A6B4A] hover:text-white transition-all px-6 h-10 text-xs font-bold"
                                    >
                                        {item.actionLabel}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            {profile && (
                <>
                    <EditProfileDialog
                        profile={profile}
                        onUpdate={fetchProfile}
                        triggerOverride={null}
                        externalOpen={editOpen}
                        setExternalOpen={setEditOpen}
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
        </div>
    );
};
