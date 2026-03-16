import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { User, Shield, Bell, CreditCard, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Profile = () => {
    const menuItems = [
        { icon: User, label: 'Personal Information', desc: 'Manage your name, email and ID' },
        { icon: Shield, label: 'Login & Security', desc: 'Update password and secure your account' },
        { icon: CreditCard, label: 'Payments & Payouts', desc: 'Review payments, payouts and taxes' },
        { icon: Bell, label: 'Notifications', desc: 'Customize what you hear from us' },
        { icon: HelpCircle, label: 'Legal & Help', desc: 'Terms of service and support' },
    ];

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <Navbar />
            <main className="container pt-10">
                <div className="max-w-2xl mx-auto space-y-12">
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-lg">
                            J
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">John Doe</h1>
                            <p className="text-muted-foreground font-medium">john.doe@example.com</p>
                            <Button variant="link" className="p-0 font-bold underline">Show profile</Button>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {menuItems.map((item, i) => (
                            <button key={i} className="flex items-center justify-between p-6 border border-border rounded-2xl bg-card hover:shadow-md transition-all text-left">
                                <div className="flex items-center gap-6">
                                    <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center text-primary">
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{item.label}</h3>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-muted-foreground" />
                            </button>
                        ))}
                    </div>

                    <div className="pt-8">
                        <Button variant="outline" className="w-full py-6 text-destructive border-destructive/20 hover:bg-destructive/5 gap-2">
                            <LogOut size={18} /> Log out
                        </Button>
                    </div>
                </div>
            </main>
            <Footer />
            <MobileNav />
        </div>
    );
};

export default Profile;
