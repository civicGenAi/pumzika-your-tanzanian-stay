import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BaobabLogo } from '@/components/BaobabLogo';

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate signup
        setTimeout(() => {
            setIsLoading(false);
            navigate('/');
        }, 1500);
    };

    return (
        <div className="flex min-h-screen flex-col bg-background md:flex-row-reverse">
            {/* Left side (Visual) - Using reverse to put visual on right on desktop */}
            <div className="relative hidden w-1/2 overflow-hidden bg-accent md:block">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-bl from-accent via-accent/80 to-transparent" />

                <div className="relative z-10 flex h-full flex-col justify-between p-12 text-accent-foreground">
                    <Link to="/" className="flex items-center gap-2">
                        <BaobabLogo className="h-10 w-10 fill-accent-foreground" />
                        <span className="font-display text-2xl font-bold">pumzika</span>
                    </Link>

                    <div className="max-w-md space-y-6">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-display text-5xl font-bold leading-tight"
                        >
                            Start your journey with us today.
                        </motion.h1>
                        <p className="text-lg text-accent-foreground/80">
                            Join our community of travelers and hosts. Discover unique stays across the pearl of Africa.
                        </p>
                    </div>

                    <div className="flex gap-8 text-sm font-medium opacity-60">
                        <span>© {new Date().getFullYear()} Pumzika</span>
                        <span>Security</span>
                        <span>Help</span>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm">
                    <div className="md:hidden mb-8 flex justify-center">
                        <Link to="/" className="flex items-center gap-2">
                            <BaobabLogo className="h-8 w-8 fill-primary" />
                            <span className="font-display text-xl font-bold">pumzika</span>
                        </Link>
                    </div>

                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">Create account</h2>
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-primary hover:underline underline-offset-4">
                                Log in
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullname">Full name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="fullname"
                                        placeholder="John Doe"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        className="pl-10 pr-10"
                                        placeholder="Min. 8 characters"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start space-x-2 pt-2">
                                <input type="checkbox" id="terms" className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" required />
                                <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground leading-snug">
                                    I agree to the <Link to="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>.
                                </Label>
                            </div>

                            <Button type="submit" className="w-full py-6 text-lg" disabled={isLoading}>
                                {isLoading ? 'Creating account...' : 'Create account'}
                            </Button>
                        </form>

                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            Your data is encrypted and secure
                        </div>

                        <div className="relative mt-8">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center text-sm font-medium leading-6">
                                <span className="bg-background px-4 text-muted-foreground">Or sign up with</span>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <Button variant="outline" className="w-full">
                                Google
                            </Button>
                            <Button variant="outline" className="w-full">
                                Facebook
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
