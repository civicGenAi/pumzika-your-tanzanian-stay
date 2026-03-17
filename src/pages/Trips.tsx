import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Loader2, Plane } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Trips = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    listing:listings (
                        title,
                        region,
                        destination,
                        listing_images (url, is_primary)
                    )
                `)
                .eq('guest_id', session.user.id)
                .order('check_in', { ascending: false });

            if (error) throw error;
            setTrips(data || []);
        } catch (error: any) {
            console.error('Error fetching trips:', error);
            toast.error('Failed to load trips');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-500 text-white';
            case 'pending_approval': return 'bg-amber-400 text-[#1A6B4A]';
            case 'cancelled': return 'bg-destructive text-white';
            default: return 'bg-secondary text-foreground';
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <Navbar />
            <main className="container pt-10">
                <div className="flex items-center gap-3 mb-10">
                    <Plane className="text-[#1A6B4A]" size={32} />
                    <h1 className="font-display text-4xl font-bold tracking-tight">Trips</h1>
                </div>

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : trips.length > 0 ? (
                    <div className="space-y-12">
                        {trips.map((trip, i) => {
                            const primaryImage = trip.listing.listing_images?.find((img: any) => img.is_primary)?.url ||
                                trip.listing.listing_images?.[0]?.url ||
                                'https://images.unsplash.com/photo-1512918766675-ed406e3c7432?w=800&fit=crop';

                            return (
                                <div key={trip.id} className="flex flex-col md:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="relative w-full md:w-80 h-56 rounded-3xl overflow-hidden shrink-0 shadow-lg">
                                        <img src={primaryImage} alt={trip.listing.title} className="w-full h-full object-cover" />
                                        <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${getStatusColor(trip.status)}`}>
                                            {trip.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4 py-2">
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#1A6B4A]">{trip.listing.title}</h2>
                                            <p className="text-muted-foreground font-medium">{trip.listing.region}, {trip.listing.destination}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-8 py-2">
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dates</span>
                                                <div className="flex items-center gap-2 font-semibold">
                                                    <Calendar size={18} className="text-[#E8A838]" />
                                                    {format(new Date(trip.check_in), 'MMM dd')} - {format(new Date(trip.check_out), 'MMM dd, yyyy')}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Guests</span>
                                                <div className="flex items-center gap-2 font-semibold">
                                                    <UserIcon size={18} className="text-[#E8A838]" />
                                                    {trip.guests_count} {trip.guests_count === 1 ? 'Guest' : 'Guests'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Paid</span>
                                                <div className="flex items-center gap-2 font-bold text-primary">
                                                    TSh {Number(trip.total_price || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 pt-4">
                                            <Button className="rounded-full bg-[#1A6B4A] hover:bg-[#1A6B4A]/90 px-6">View Itinerary</Button>
                                            <Button variant="outline" className="rounded-full px-6">Message Host</Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-24 text-center bg-card rounded-[32px] border border-dashed border-border">
                        <div className="h-24 w-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                            <Plane size={40} className="text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1A6B4A]">No trips booked yet</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto mt-2">When you book a stay, your itinerary and details will appear here.</p>
                        <Button className="mt-8 rounded-full bg-[#E8A838] px-8 py-6 font-bold text-[#1A6B4A] shadow-md" asChild>
                            <Link to="/">Explore Tanzania</Link>
                        </Button>
                    </div>
                )}
            </main>
            <Footer />
            <MobileNav />
        </div>
    );
};

// Internal icon component to avoid conflicts
const UserIcon = ({ size, className }: { size: number, className: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

export default Trips;
