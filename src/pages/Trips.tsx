import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Loader2, Plane, MessageSquare, Info, ShieldCheck, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getOrCreateConversation } from '@/lib/messaging';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const Trips = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState<any>(null);
    const [isItineraryOpen, setIsItineraryOpen] = useState(false);

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
                        id,
                        title,
                        region,
                        destination,
                        description,
                        address,
                        host_id,
                        host:users!listings_host_id_fkey (
                            full_name,
                            avatar_url
                        ),
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

    const handleMessageHost = async (hostId: string, bookingId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const conversationId = await getOrCreateConversation([user.id, hostId], bookingId);
            navigate(`/inbox?conv=${conversationId}`);
        } catch (error) {
            toast.error('Could not start conversation');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-500 text-white';
            case 'pending': return 'bg-amber-400 text-[#1A6B4A]';
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
                                    <div className="relative w-full md:w-80 h-56 rounded-3xl overflow-hidden shrink-0 shadow-lg group">
                                        <img src={primaryImage} alt={trip.listing.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${getStatusColor(trip.status)}`}>
                                            {trip.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4 py-2 w-full">
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#1A6B4A]">{trip.listing.title}</h2>
                                            <p className="text-muted-foreground font-medium">{trip.listing.region}, {trip.listing.destination}</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-2">
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
                                                    <User size={18} className="text-[#E8A838]" />
                                                    {trip.guests_count} {trip.guests_count === 1 ? 'Guest' : 'Guests'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Status</span>
                                                <div className="flex items-center gap-2 font-bold text-primary capitalize">
                                                    <ShieldCheck size={18} className="text-[#1A6B4A]" />
                                                    {trip.payment_status || 'Paid'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4 pt-4">
                                            <Button
                                                onClick={() => { setSelectedTrip(trip); setIsItineraryOpen(true); }}
                                                className="rounded-full bg-[#1A6B4A] hover:bg-[#1A6B4A]/90 px-8 flex items-center gap-2"
                                            >
                                                <Info size={18} /> View Itinerary
                                            </Button>
                                            <Button
                                                onClick={() => handleMessageHost(trip.listing.host_id, trip.id)}
                                                variant="outline" className="rounded-full px-8 flex items-center gap-2 border-[#1A6B4A] text-[#1A6B4A] hover:bg-[#1A6B4A]/5"
                                            >
                                                <MessageSquare size={18} /> Message Host
                                            </Button>
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

            {/* Itinerary Dialog */}
            <Dialog open={isItineraryOpen} onOpenChange={setIsItineraryOpen}>
                <DialogContent className="max-w-xl rounded-[32px] overflow-hidden p-0 gap-0 border-none">
                    {selectedTrip && (
                        <div className="space-y-0">
                            <div className="relative h-48 bg-muted">
                                <img
                                    src={selectedTrip.listing.listing_images?.[0]?.url || 'https://images.unsplash.com/photo-1512918766675-ed406e3c7432?w=800&fit=crop'}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                                    <div className="text-white">
                                        <h3 className="text-2xl font-bold leading-tight">{selectedTrip.listing.title}</h3>
                                        <p className="opacity-90 flex items-center gap-1.5 mt-1">
                                            <MapPin size={14} /> {selectedTrip.listing.address || 'Arusha, Tanzania'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-8 border-b border-border pb-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Check-in</p>
                                        <p className="text-lg font-bold text-[#1A6B4A]">{format(new Date(selectedTrip.check_in), 'EEEE, MMM dd')}</p>
                                        <p className="text-sm text-muted-foreground">After 2:00 PM</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Check-out</p>
                                        <p className="text-lg font-bold text-[#1A6B4A]">{format(new Date(selectedTrip.check_out), 'EEEE, MMM dd')}</p>
                                        <p className="text-sm text-muted-foreground">Before 11:00 AM</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-[#1A6B4A] flex items-center gap-2">
                                        <ShieldCheck size={18} className="text-[#E8A838]" /> Booking Information
                                    </h4>
                                    <div className="bg-secondary/30 rounded-2xl p-4 text-sm space-y-2 border border-[#1A6B4A]/10">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground font-medium">Reservation ID</span>
                                            <span className="font-mono text-xs font-bold uppercase tracking-tighter bg-white px-2 py-0.5 rounded-md border">{selectedTrip.id.split('-')[0]}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground font-medium">Total Paid</span>
                                            <span className="font-bold text-[#1A6B4A]">TSh {Number(selectedTrip.total_price || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground font-medium">Guests</span>
                                            <span className="font-bold">{selectedTrip.guests_count} adults</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-[#1A6B4A]">The Host</h4>
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={selectedTrip.listing.host?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Host'}
                                            className="h-12 w-12 rounded-full border-2 border-primary/20"
                                        />
                                        <div>
                                            <p className="font-bold">{selectedTrip.listing.host?.full_name || 'Owner'}</p>
                                            <p className="text-xs text-muted-foreground">Pumzika Verified Host</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleMessageHost(selectedTrip.listing.host_id, selectedTrip.id)}
                                            className="ml-auto text-primary font-bold hover:bg-primary/5"
                                        >
                                            Message
                                        </Button>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button className="w-full h-14 rounded-2xl bg-[#E8A838] font-bold text-[#1A6B4A] flex items-center justify-center gap-2 hover:bg-[#E8A838]/90">
                                        <MapPin size={20} /> Get Directions
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

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
