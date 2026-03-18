import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, ShieldCheck, Phone, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuthDrawer } from '@/context/AuthDrawerContext';

export const AuthDrawer = () => {
    const { isOpen, view, closeAuth } = useAuthDrawer();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeView, setActiveView] = useState<'login' | 'register'>('login');

    // Sync activeView with context view when it opens
    useEffect(() => {
        if (isOpen) {
            setActiveView(view);
        }
    }, [isOpen, view]);

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('+255');
    const [role, setRole] = useState<'guest' | 'host'>('guest');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            toast.success('Welcome back!');

            // Check role for redirection
            if (data.user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                closeAuth();

                if (profile?.role === 'admin') {
                    window.location.href = '/admin';
                } else {
                    window.location.reload();
                }
            } else {
                closeAuth();
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 13) {
            toast.error('Please enter a valid Tanzania phone number');
            return;
        }
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName, phone, role } }
            });
            if (error) throw error;
            toast.success('Registration successful! Please check your email.');
            setActiveView('login');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create account');
        } finally {
            setIsLoading(false);
        }
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
                        onClick={closeAuth}
                        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm md:hidden"
                    />
                    {/* Drawer */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 bottom-0 z-[9999] flex flex-col rounded-t-[32px] bg-card p-6 pb-12 shadow-2xl md:hidden max-h-[90vh] overflow-y-auto outline-none"
                        style={{ top: 'auto' }}
                    >
                        <div className="mx-auto mb-6 h-1.5 w-12 shrink-0 rounded-full bg-border" />

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold tracking-tight text-primary">
                                {activeView === 'login' ? 'Welcome Back' : 'Join Pumzika'}
                            </h2>
                            <button onClick={closeAuth} className="p-2 rounded-full bg-slate-100">
                                <X size={20} />
                            </button>
                        </div>

                        {activeView === 'login' ? (
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="drawer-email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="drawer-email"
                                            type="email"
                                            className="pl-10 h-12"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="drawer-password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="drawer-password"
                                            type={showPassword ? 'text' : 'password'}
                                            className="pl-10 pr-10 h-12"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3.5 text-muted-foreground"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-14 text-lg font-bold" disabled={isLoading}>
                                    {isLoading ? 'Processing...' : 'Log In'}
                                </Button>
                                <p className="text-center text-sm text-muted-foreground">
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setActiveView('register')}
                                        className="font-bold text-primary underline"
                                    >
                                        Sign up
                                    </button>
                                </p>
                            </form>
                        ) : (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>I want to...</Label>
                                    <Tabs value={role} onValueChange={(v) => setRole(v as any)} className="w-full">
                                        <TabsList className="grid h-12 w-full grid-cols-2">
                                            <TabsTrigger value="guest" className="gap-2">Guest</TabsTrigger>
                                            <TabsTrigger value="host" className="gap-2">Host</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="drawer-name">Full Name</Label>
                                    <Input id="drawer-name" className="h-11" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="drawer-reg-email">Email</Label>
                                    <Input id="drawer-reg-email" type="email" className="h-11" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="drawer-phone">Phone</Label>
                                    <Input id="drawer-phone" className="h-11" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="drawer-reg-pass">Password</Label>
                                    <Input id="drawer-reg-pass" type="password" className="h-11" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <Button type="submit" className="w-full h-14 text-lg font-bold mt-4" disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create Account'}
                                </Button>
                                <p className="text-center text-sm text-muted-foreground">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setActiveView('login')}
                                        className="font-bold text-primary underline"
                                    >
                                        Log in
                                    </button>
                                </p>
                            </form>
                        )}

                        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            Secure Tanzanian Stays
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
