import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { ListingCard, ListingData } from '@/components/ListingCard';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { StateFeedback } from '@/components/StateFeedback';
import { SearchPill } from '@/components/SearchPill';
import { filterChips } from '@/data/sampleData';

const SearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const locationParam = searchParams.get('location') || '';
    const dateParam = searchParams.get('dates') || '';
    const guestParam = searchParams.get('guests') || '';
    const categoryParam = searchParams.get('category') || 'All';

    const updateFilter = (category: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (category === 'All' || category === categoryParam) {
            newParams.delete('category');
        } else {
            newParams.set('category', category);
        }
        setSearchParams(newParams);
    };

    const [listings, setListings] = useState<ListingData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchResults();
    }, [locationParam, dateParam, guestParam, categoryParam]);

    const fetchResults = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('listings')
                .select(`
                    *,
                    listing_images(url, is_primary),
                    host:users(is_superhost)
                `)
                .eq('status', 'published');

            if (locationParam) {
                query = query.or(`region.ilike.%${locationParam}%,destination.ilike.%${locationParam}%`);
            }

            if (categoryParam !== 'All') {
                query = query.contains('amenities', [categoryParam]);
            }

            const { data, error } = await query;
            if (error) throw error;

            const formattedData: ListingData[] = (data || []).map(item => ({
                id: item.id,
                title: item.title,
                location: `${item.region}, ${item.destination}`,
                city: item.destination,
                price: Number(item.base_price),
                usdPrice: Math.round(Number(item.base_price) / 2600),
                rating: item.average_rating || 5.0,
                reviews: item.review_count || 0,
                image: item.listing_images?.find((img: any) => img.is_primary)?.url || item.listing_images?.[0]?.url,
                badges: item.amenities || [],
                isSuperhost: item.host?.is_superhost || false,
                instantBook: item.instant_book,
                description: item.description
            }));

            setListings(formattedData);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <Navbar />

            <main className="container max-w-7xl pt-6 md:pt-10">
                <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                            {listings.length} stays found {locationParam && `in ${locationParam}`}
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {dateParam || 'Anytime'} · {guestParam ? `${guestParam} guests` : 'Any guests'}
                        </p>
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="scrollbar-hide mb-8 flex gap-2 overflow-x-auto pb-2">
                    {filterChips.map((chip) => (
                        <button
                            key={chip.label}
                            onClick={() => updateFilter(chip.label)}
                            className={`shrink-0 rounded-pill px-4 py-2 text-sm font-medium transition-all ${categoryParam === chip.label
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'border border-border bg-card text-foreground hover:bg-secondary'
                                }`}
                        >
                            {chip.emoji && <span className="mr-1.5">{chip.emoji}</span>}
                            {chip.label}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array(8).fill(0).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : listings.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {listings.map((listing, i) => (
                            <Link to={`/listing/${listing.id}`} key={listing.id}>
                                <ListingCard listing={listing} index={i} />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <StateFeedback
                        title="No results found"
                        message="Try adjusting your filters or searching for a different area."
                        actionLabel="Clear all filters"
                        onAction={() => window.location.href = '/search'}
                    />
                )}
            </main>

            <Footer />
            <MobileNav />
        </div>
    );
};

export default SearchResults;
