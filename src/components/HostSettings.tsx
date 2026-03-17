import { useState, useEffect } from 'react';
import { User, Bell, Shield, CreditCard, HelpCircle, LogOut, Loader2, Camera, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
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

    // Dialog states
    const [editOpen, setEditOpen] = useState(false);
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

    const sections = [
        {
            icon: User,
            label: 'Personal Information',
            desc: 'Manage your host bio, name and phone',
            onClick: () => setEditOpen(true)
        },
        {
            icon: Shield,
            label: 'Login & Security',
            desc: 'Secure your hosting account',
            onClick: () => setSecurityOpen(true)
        },
        {
            icon: CreditCard,
            label: 'Payout Methods',
            desc: 'Where you receive your earnings',
            onClick: () => setPaymentsOpen(true)
        },
        {
            icon: Bell,
            label: 'Notifications',
            desc: 'Control host alerts and guest messages',
            onClick: () => setNotificationsOpen(true)
        },
        {
            icon: HelpCircle,
            label: 'Legal & Help',
            desc: 'Host terms and support resources',
            onClick: () => setHelpOpen(true)
        },
    ];

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

            {/* Settings Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map((item, i) => (
                    <button
                        key={i}
                        onClick={item.onClick}
                        className="flex flex-col gap-4 p-6 bg-white border border-border/50 rounded-3xl hover:shadow-lg hover:border-[#1A6B4A]/20 transition-all text-left group"
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
