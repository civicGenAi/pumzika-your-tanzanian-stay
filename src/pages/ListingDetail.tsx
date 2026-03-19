import { useParams, useNavigate } from 'react-router-dom';
import {
    Star,
    MapPin,
    Heart,
    Share,
    Shield,
    Zap,
    Calendar,
    Wifi,
    Tv,
    Wind,
    Waves,
    Car,
    Coffee,
    Utensils,
    Lock,
    X,
    Info
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { calculatePrice } from '@/lib/pricing';
import { isDateRangeAvailable } from '@/lib/availability';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuthDrawer } from '@/context/AuthDrawerContext';

const ListingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { openAuth } = useAuthDrawer();
    const [user, setUser] = useState<any>(null);
    const [listing, setListing] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Booking states
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [guests, setGuests] = useState(1);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [showPhotos, setShowPhotos] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });
        fetchListing();
        fetchReviews();
    }, [id]);

    useEffect(() => {
        if (checkIn && checkOut && id) {
            checkDates();
        } else {
            setIsAvailable(null);
        }
    }, [checkIn, checkOut, id]);

    const checkDates = async () => {
        if (!checkIn || !checkOut || !id) return;
        setIsCheckingAvailability(true);
        try {
            const startDate = checkIn.toISOString().split('T')[0];
            const endDate = checkOut.toISOString().split('T')[0];
            const result = await isDateRangeAvailable(id, startDate, endDate);
            setIsAvailable(result.isAvailable);
            if (!result.isAvailable) {
                toast.error('Those dates are already booked. Please try different ones.');
            }
        } catch (error) {
            console.error('Availability check failed:', error);
        } finally {
            setIsCheckingAvailability(false);
        }
    };

    const fetchListing = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('listings')
                .select(`
                    *,
                    listing_images(*),
                    host:users(*)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setListing(data);
        } catch (error) {
            console.error('Error fetching listing:', error);
            toast.error('Could not load listing details');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    reviewer:users!reviewer_id (
                        full_name,
                        avatar_url
                    )
                `)
                .eq('listing_id', id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground animate-pulse">Loading Tanzanian hospitality...</p>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">Listing not found</h1>
                <Button onClick={() => navigate('/')} className="mt-4">Go home</Button>
            </div>
        );
    }

    const images = listing.listing_images?.sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)).map((img: any) => img.url) || [];
    if (images.length === 0) images.push('https://images.unsplash.com/photo-1512918766675-ed406e3c7432?w=1200&fit=crop');

    const pricing = checkIn && checkOut && isAvailable ? calculatePrice({
        basePrice: Number(listing.base_price),
        cleaningFee: Number(listing.cleaning_fee || 0),
        securityDeposit: Number(listing.security_deposit || 0),
        checkIn,
        checkOut,
        weekendMultiplier: Number(listing.weekend_price_multiplier || 1.0)
    }) : null;

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <Navbar />

            <main className="container max-w-7xl pt-6 md:pt-10">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                            {listing.title}
                        </h1>
                        <div className="hidden items-center gap-4 md:flex">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <Share size={16} /> Share
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <Heart size={16} /> Save
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 font-semibold">
                                <Star size={14} className="fill-foreground" />
                                <span>{listing.average_rating || 'New'}</span>
                                <span className="font-normal text-muted-foreground underline">({listing.review_count || 0} reviews)</span>
                            </div>
                            {listing.host?.is_superhost && (
                                <div className="flex items-center gap-1">
                                    <Shield size={14} />
                                    <span className="font-semibold">Superhost</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1 underline underline-offset-2">
                                <MapPin size={14} />
                                <span className="font-medium">{listing.region}, {listing.destination}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Gallery - Airbnb style grid */}
                <section className="relative overflow-hidden rounded-2xl">
                    <div className="grid h-[300px] grid-cols-1 gap-2 md:h-[500px] md:grid-cols-4 md:grid-rows-2">
                        <div className="relative col-span-1 row-span-1 overflow-hidden md:col-span-2 md:row-span-2">
                            <img
                                src={images[0]}
                                alt={listing.title}
                                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                        </div>
                        {images.slice(1, 5).map((img: any, i: number) => (
                            <div key={i} className="relative hidden overflow-hidden md:block">
                                <img
                                    src={img}
                                    alt={`${listing.title} view ${i + 1}`}
                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            className="absolute bottom-4 right-4 bg-background/90 text-xs backdrop-blur-sm md:text-sm shadow-sm"
                            size="sm"
                            onClick={() => setShowPhotos(true)}
                        >
                            Show all photos
                        </Button>
                    </div>

                    {/* Fullscreen Photo Gallery Overlay */}
                    <AnimatePresence>
                        {showPhotos && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[100] bg-black p-4 md:p-10 flex flex-col"
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-4 right-4 text-white hover:bg-white/20"
                                    onClick={() => setShowPhotos(false)}
                                >
                                    <X size={24} />
                                </Button>
                                <div className="flex-1 overflow-y-auto mt-10">
                                    <div className="max-w-4xl mx-auto space-y-4">
                                        {images.map((img: string, i: number) => (
                                            <img
                                                key={i}
                                                src={img}
                                                alt={`Gallery view ${i + 1}`}
                                                className="w-full rounded-lg object-cover"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* Content Section */}
                <section className="mt-8 grid grid-cols-1 gap-12 md:mt-12 md:grid-cols-3">
                    {/* Main Info */}
                    <div className="md:col-span-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-display text-xl font-semibold md:text-2xl">
                                    Hosted by {listing.host?.full_name?.split(' ')[0] || 'Host'}
                                </h2>
                                <p className="mt-1 text-muted-foreground capitalize">
                                    {listing.category} in {listing.region} · {listing.guests} guests · {listing.bedrooms} bedrooms · {listing.beds || 0} beds · {listing.bathrooms} bath
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-secondary overflow-hidden">
                                {listing.host?.avatar_url && (
                                    <img src={listing.host.avatar_url} alt={listing.host.full_name} className="h-full w-full object-cover" />
                                )}
                            </div>
                        </div>

                        <Separator className="my-8" />

                        <div className="space-y-6">
                            {listing.host?.is_superhost && (
                                <div className="flex gap-4">
                                    <Shield className="mt-1 shrink-0 text-primary" size={24} />
                                    <div>
                                        <h3 className="font-semibold">Superhost</h3>
                                        <p className="text-sm text-muted-foreground">Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-4">
                                <Zap className="mt-1 shrink-0 text-primary" size={24} />
                                <div>
                                    <h3 className="font-semibold">Self check-in</h3>
                                    <p className="text-sm text-muted-foreground">Check yourself in with the lockbox.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Calendar className="mt-1 shrink-0 text-primary" size={24} />
                                <div>
                                    <h3 className="font-semibold">Free cancellation for 48 hours</h3>
                                    <p className="text-sm text-muted-foreground">Get a full refund if you change your mind.</p>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-8" />

                        {/* Description */}
                        <div className="space-y-4">
                            <h3 className="font-display text-xl font-semibold">About this space</h3>
                            <div className={cn(
                                "relative leading-relaxed text-muted-foreground transition-all duration-300",
                                !isExpanded && "max-h-24 overflow-hidden"
                            )}>
                                {listing.description || "Welcome to our beautiful stay in Tanzania. We provide everything you need for a comfortable and memorable experience."}
                                {!isExpanded && (
                                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
                                )}
                            </div>
                            <Button
                                variant="link"
                                className="p-0 font-semibold underline text-[#1A6B4A]"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? 'Show less' : 'Show more'}
                            </Button>
                        </div>

                        <Separator className="my-8" />

                        {/* Amenities */}
                        <div className="space-y-4">
                            <h3 className="font-display text-xl font-semibold">What this place offers</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {(listing.amenities || []).map((item: string) => {
                                    const iconMap: any = {
                                        wifi: Wifi,
                                        tv: Tv,
                                        ac: Wind,
                                        pool: Waves,
                                        parking: Car,
                                        coffee: Coffee,
                                        kitchen: Utensils,
                                        security: Lock
                                    };
                                    const Icon = iconMap[item] || Info;
                                    return (
                                        <div key={item} className="flex items-center gap-4 text-muted-foreground text-sm">
                                            <Icon size={18} className="text-[#1A6B4A]/70" />
                                            <span className="capitalize">{item.replace('_', ' ')}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            {(listing.amenities?.length || 0) > 10 && (
                                <Button variant="outline" className="mt-4">Show all {listing.amenities.length} amenities</Button>
                            )}
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div className="relative">
                        <div className="sticky top-28 rounded-2xl border border-border bg-card p-6 shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-xl font-bold md:text-2xl">TSh {Number(listing.base_price).toLocaleString()}</span>
                                    <span className="text-muted-foreground"> / night</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-semibold">
                                    <Star size={14} className="fill-foreground" />
                                    <span>{listing.average_rating || 'New'}</span>
                                </div>
                            </div>

                            <div className="mt-6 space-y-0 rounded-xl border border-border">
                                <div className="grid grid-cols-2 divide-x divide-border">
                                    <div className="flex flex-col p-3 text-left transition-colors hover:bg-muted/50 cursor-pointer">
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Check-in</span>
                                        <input
                                            type="date"
                                            min={today}
                                            className="bg-transparent border-none p-0 text-sm focus:ring-0 w-full"
                                            onChange={(e) => {
                                                const d = e.target.value ? new Date(e.target.value) : null;
                                                setCheckIn(d);
                                                if (checkOut && d && d >= checkOut) setCheckOut(null);
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col p-3 text-left transition-colors hover:bg-muted/50 cursor-pointer">
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Checkout</span>
                                        <input
                                            type="date"
                                            min={checkIn ? new Date(new Date(checkIn).setDate(checkIn.getDate() + 1)).toISOString().split('T')[0] : tomorrow}
                                            className="bg-transparent border-none p-0 text-sm focus:ring-0 w-full"
                                            onChange={(e) => setCheckOut(e.target.value ? new Date(e.target.value) : null)}
                                            value={checkOut ? checkOut.toISOString().split('T')[0] : ''}
                                        />
                                    </div>
                                </div>
                                <div className="flex w-full flex-col border-t border-border p-3 text-left transition-colors hover:bg-muted/50">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Guests</span>
                                    <select
                                        className="bg-transparent border-none p-0 text-sm focus:ring-0"
                                        value={guests}
                                        onChange={(e) => setGuests(Number(e.target.value))}
                                    >
                                        {[...Array(listing.guests || 1)].map((_, i) => (
                                            <option key={i} value={i + 1}>{i + 1} guest{i > 0 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {!user ? (
                                <Button
                                    className="mt-4 w-full py-6 text-lg font-semibold bg-[#E8A838] text-[#1A6B4A] hover:bg-[#E8A838]/90"
                                    size="lg"
                                    onClick={() => {
                                        if (window.innerWidth < 768) {
                                            openAuth('login');
                                        } else {
                                            navigate('/login');
                                        }
                                    }}
                                >
                                    Log in to book
                                </Button>
                            ) : (
                                <Button
                                    className="mt-4 w-full py-6 text-lg font-semibold"
                                    size="lg"
                                    disabled={!pricing || isCheckingAvailability || isAvailable === false}
                                    onClick={() => navigate('/checkout', {
                                        state: {
                                            listing,
                                            pricing,
                                            dates: { checkIn, checkOut },
                                            guests
                                        }
                                    })}
                                >
                                    {isCheckingAvailability ? 'Checking...' : isAvailable === false ? 'Dates unavailable' : pricing ? 'Reserve' : 'Select dates'}
                                </Button>
                            )}

                            <p className="mt-4 text-center text-sm text-muted-foreground">
                                You won't be charged yet
                            </p>

                            {pricing && (
                                <div className="mt-6 space-y-3 text-sm">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span className="underline">TSh {Number(listing.base_price).toLocaleString()} x {pricing.totalNights} nights</span>
                                        <span>TSh {pricing.nightlySubtotal.toLocaleString()}</span>
                                    </div>
                                    {pricing.cleaningFee > 0 && (
                                        <div className="flex justify-between text-muted-foreground">
                                            <span className="underline">Cleaning fee</span>
                                            <span>TSh {pricing.cleaningFee.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-muted-foreground">
                                        <span className="underline">Pumzika service fee (14%)</span>
                                        <span>TSh {pricing.serviceFee.toLocaleString()}</span>
                                    </div>
                                    {pricing.securityDeposit > 0 && (
                                        <div className="flex justify-between text-muted-foreground">
                                            <span className="underline">Security deposit</span>
                                            <span>TSh {pricing.securityDeposit.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between font-bold">
                                        <span>Total</span>
                                        <span>TSh {pricing.totalGuestPays.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <Separator className="my-12" />

                {/* Reviews Section */}
                <section id="reviews" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-8">
                        <Star className="fill-accent text-accent" size={24} />
                        <h2 className="font-display text-2xl font-bold">
                            {reviews.length > 0 ? (
                                <div className="flex items-center gap-2">
                                    <span>{(reviews.reduce((acc, r) => acc + r.overall_rating, 0) / reviews.length).toFixed(1)}</span>
                                    <span>·</span>
                                    <span>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
                                </div>
                            ) : (
                                'No reviews yet'
                            )}
                        </h2>
                    </div>

                    {reviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                            {reviews.map((review) => (
                                <div key={review.id} className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-secondary overflow-hidden border border-border">
                                            {review.reviewer?.avatar_url ? (
                                                <img src={review.reviewer.avatar_url} alt={review.reviewer.full_name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-primary/5">
                                                    <UserIcon size={20} className="text-primary/40" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#1A6B4A]">{review.reviewer?.full_name}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={12}
                                                className={i < review.overall_rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm leading-relaxed text-foreground/80 italic">
                                        "{review.comment}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-secondary/20 rounded-3xl p-12 text-center border border-dashed border-border">
                            <Star size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                            <p className="text-muted-foreground">Every stay here can be reviewed by guests. Book your stay to be the first!</p>
                        </div>
                    )}
                </section>
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

export default ListingDetail;
