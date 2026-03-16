import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, DollarSign, Home, Shield, Users, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const BecomeHost = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-primary px-4 py-20 text-primary-foreground md:py-32">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30" />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />
                    </div>

                    <div className="container relative z-10">
                        <div className="max-w-2xl space-y-8">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="font-display text-4xl font-bold leading-tight md:text-6xl"
                            >
                                Earn more than just memories. Host on Pumzika.
                            </motion.h1>
                            <p className="text-xl text-primary-foreground/80 md:text-2xl">
                                Join thousands of hosts across Tanzania and turn your space into your next big opportunity.
                            </p>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                                    <Link to="/register">Get started now</Link>
                                </Button>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>500+ people hosting right now</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Earning Estimator (Professional feel) */}
                <section className="container -mt-12 relative z-20">
                    <div className="rounded-3xl border border-border bg-card p-8 shadow-2xl md:p-12">
                        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
                            <div className="space-y-6">
                                <h2 className="font-display text-3xl font-bold">Pumzika it easy to host</h2>
                                <div className="space-y-4">
                                    {[
                                        { title: 'One-to-one guidance', desc: 'Get matched with a Superhost for hosting help.' },
                                        { title: 'An experienced first guest', desc: 'Choose to welcome an experienced guest for your first stay.' },
                                        { title: 'Specialized support', desc: 'New hosts get one-tap access to trained agents.' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{item.title}</h3>
                                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-secondary/30 rounded-2xl p-8 text-center space-y-4">
                                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Estimate your earnings</p>
                                <div className="text-5xl font-bold text-primary">TSh 850,000</div>
                                <p className="text-muted-foreground">estimated monthly income at 75% occupancy</p>
                                <Separator className="my-4" />
                                <div className="flex justify-between items-center text-sm">
                                    <span className="flex items-center gap-1"><MapPin size={14} /> Arusha</span>
                                    <span className="flex items-center gap-1"><Home size={14} /> Entire Home</span>
                                    <span className="flex items-center gap-1"><Users size={14} /> 4 Guests</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Global Protection Section */}
                <section className="container py-20 text-center space-y-12">
                    <div className="max-w-2xl mx-auto space-y-4">
                        <h2 className="font-display text-3xl font-bold italic text-primary">pumzika<span className="text-foreground">Cover</span></h2>
                        <p className="text-5xl font-bold tracking-tight">Top-to-bottom protection.</p>
                        <p className="text-lg text-muted-foreground">Hosting shouldn't be stressful. We've got you covered with $1M in damage protection and $1M in liability insurance.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Shield, title: 'Guest identity verification', desc: 'Our verification system checks details such as name, address, and more.' },
                            { icon: Star, title: 'Reservation screening', desc: 'Our technology analyzes several factors to help identify high-risk reservations.' },
                            { icon: DollarSign, title: '$1M damage protection', desc: 'Pumzika reimburses you for damage caused by guests to your home and belongings.' }
                        ].map((feature, i) => (
                            <div key={i} className="p-6 space-y-4 border border-border rounded-xl hover:shadow-lg transition-shadow">
                                <div className="h-12 w-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                                    <feature.icon className="text-primary" size={24} />
                                </div>
                                <h3 className="font-semibold text-lg">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Call to Action */}
                <section className="container pb-20">
                    <div className="bg-primary-foreground border border-primary/20 rounded-3xl p-12 text-center space-y-8">
                        <h2 className="text-4xl font-bold">Ready to host?</h2>
                        <p className="max-w-xl mx-auto text-lg text-muted-foreground">List your space today and start seeing the bookings roll in. Our team is here to help you every step of the way.</p>
                        <div className="flex justify-center gap-4">
                            <Button size="lg" className="px-8" asChild>
                                <Link to="/register">Create your listing</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default BecomeHost;
