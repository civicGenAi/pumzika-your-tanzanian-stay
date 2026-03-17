import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const BookingSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // We can pull trip details from location state if we want to be fancy
    const booking = location.state?.booking;

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="container max-w-2xl pt-20 pb-32 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="flex flex-col items-center"
                >
                    <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-8">
                        <CheckCircle2 size={48} strokeWidth={2.5} />
                    </div>

                    <h1 className="text-4xl font-bold text-[#1A6B4A] mb-4">Karibu! Booking Confirmed</h1>
                    <p className="text-lg text-muted-foreground mb-12">
                        Get ready for your stay. We've sent the confirmation details and check-in instructions to your email.
                    </p>

                    <div className="w-full bg-[#F7F7F7] rounded-[32px] p-8 border border-border/50 text-left space-y-6 mb-12">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-xl text-[#1A6B4A] shadow-sm">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Destination</div>
                                <div className="font-bold text-lg">Your Tanzanian Gateway</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-xl text-[#1A6B4A] shadow-sm">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Upcoming Trip</div>
                                <div className="font-bold text-lg">Manage your dates in the Trips section.</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <Button
                            className="flex-1 py-7 rounded-2xl bg-[#1A6B4A] text-white text-lg font-bold hover:bg-[#1A6B4A]/90"
                            onClick={() => navigate('/trips')}
                        >
                            View your Trips
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 py-7 rounded-2xl border-2 border-[#1A6B4A]/20 text-[#1A6B4A] text-lg font-bold hover:bg-[#1A6B4A]/5"
                            onClick={() => navigate('/')}
                        >
                            Explore more
                            <ArrowRight className="ml-2" size={20} />
                        </Button>
                    </div>
                </motion.div>
            </main>
            <Footer />
            <MobileNav />
        </div>
    );
};

export default BookingSuccess;
