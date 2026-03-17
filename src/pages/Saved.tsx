import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { ListingCard } from '@/components/ListingCard';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Heart } from 'lucide-react';

const Saved = () => {
    const navigate = useNavigate();
    const [savedListings, setSavedListings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSavedListings();
    }, []);

    const fetchSavedListings = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            const { data, error } = await supabase
                .from('wishlists')
                .select(`
                    id,
                    listing:listings (
                        *,
                        listing_images (url, is_primary)
                    )
                `)
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to match ListingData interface
            const transformed = data.map((item: any) => {
                const listing = item.listing;
                const primaryImage = listing.listing_images?.find((img: any) => img.is_primary)?.url ||
                    listing.listing_images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1512918766675-ed406e3c7432?w=800&fit=crop';

                return {
                    id: listing.id,
                    title: listing.title,
                    location: `${listing.region}, ${listing.destination}`,
                    city: listing.destination,
                    price: listing.base_price,
                    rating: listing.average_rating || 4.8,
                    reviews: 0,
                    image: primaryImage,
                    badges: [],
                    isSuperhost: false,
                    instantBook: listing.instant_book
                };
            });

            setSavedListings(transformed);
        } catch (error: any) {
            console.error('Error fetching wishlist:', error);
            toast.error('Failed to load saved stays');
        } finally {
            setIsLoading(false);
        }
    };

    const handleWishlistToggle = (listingId: string, isSaved: boolean) => {
        if (!isSaved) {
            setSavedListings(prev => prev.filter(l => l.id !== listingId));
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <Navbar />
            <main className="container pt-10">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="text-destructive fill-destructive" size={32} />
                    <h1 className="font-display text-4xl font-bold tracking-tight">Saved</h1>
                </div>

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : savedListings.length > 0 ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
                        {savedListings.map((listing, i) => (
                            <Link to={`/listing/${listing.id}`} key={listing.id}>
                                <ListingCard
                                    listing={listing}
                                    index={i}
                                    onWishlistToggle={handleWishlistToggle}
                                />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center space-y-4 bg-card rounded-3xl border border-dashed border-border mt-8">
                        <div className="h-20 w-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart size={32} className="text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold">No saved stays yet</h2>
                        <p className="text-muted-foreground">As you search, click the heart icon to save your favorite places.</p>
                        <Link to="/" className="inline-flex text-primary font-bold hover:underline">Start exploring</Link>
                    </div>
                )}
            </main>
            <Footer />
            <MobileNav />
        </div>
    );
};

export default Saved;
