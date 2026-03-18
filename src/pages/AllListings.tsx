import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { ListingCard, ListingData } from '@/components/ListingCard';
import { filterChips, destinations } from '@/data/sampleData';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, X, SlidersHorizontal, ChevronDown, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAmenityStats } from '@/lib/discovery';

const AllListings = () => {
    const [searchParams] = useSearchParams();
    const [listings, setListings] = useState<ListingData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [amenityStats, setAmenityStats] = useState<Record<string, number>>({});
    const [destinationStats, setDestinationStats] = useState<Record<string, number>>({});

    // Filters state
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
        searchParams.get('category') ? [searchParams.get('category') as string] : []
    );
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
        searchParams.get('location') ? [searchParams.get('location') as string] : []
    );

    useEffect(() => {
        if (isFilterOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isFilterOpen]);

    useEffect(() => {
        // Source of truth: URL params
        const urlLocation = searchParams.get('location');
        const urlCategory = searchParams.get('category');
        const urlQuery = searchParams.get('q');

        // Update destinations if provided, otherwise clear if was set from URL
        if (urlLocation) {
            setSelectedDestinations([urlLocation]);
        } else if (searchParams.has('location') === false && selectedDestinations.length === 1 && destinations.some(d => d.name === selectedDestinations[0])) {
            // Only clear if it was an automated set, but let user keep their UI choices for now
            // Actually, let's keep it simple: sync URL to state.
        }

        // Simplified sync: URL -> State (Initial load or explicit navigation)
        if (urlLocation) setSelectedDestinations([urlLocation]);
        if (urlCategory) setSelectedAmenities([urlCategory]);
        if (urlQuery) setSearchQuery(urlQuery);
    }, [searchParams]);

    useEffect(() => {
        fetchListings();
        loadStats();
    }, [selectedAmenities, priceRange, searchQuery, selectedDestinations]);

    const loadStats = async () => {
        const aStats = await fetchAmenityStats();
        setAmenityStats(aStats);

        const { data } = await supabase.from('listings').select('destination').eq('status', 'published');
        const dStats: Record<string, number> = {};
        data?.forEach(l => {
            const d = l.destination.charAt(0).toUpperCase() + l.destination.slice(1);
            dStats[d] = (dStats[d] || 0) + 1;
        });
        setDestinationStats(dStats);
    };

    const fetchListings = async () => {
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

            // Destinations from sidebar + search query
            if (selectedDestinations.length > 0) {
                query = query.in('destination', selectedDestinations.map(d => d.toLowerCase()));
            }

            // Amenities filter
            if (selectedAmenities.length > 0) {
                // Filter listings that have ALL selected amenities
                query = query.contains('amenities', selectedAmenities);
            }

            if (searchQuery) {
                query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,region.ilike.%${searchQuery}%`);
            }

            query = query.gte('base_price', priceRange[0]).lte('base_price', priceRange[1]);

            const { data, error } = await query;
            if (error) throw error;

            const formatted = (data || []).map(item => ({
                id: item.id,
                title: item.title,
                location: `${item.region}, ${item.destination}`,
                city: item.destination,
                price: Number(item.base_price),
                usdPrice: Math.round(Number(item.base_price) / 2600),
                rating: item.average_rating || 5.0,
                reviews: item.review_count || 0,
                image: item.listing_images?.find((img: any) => img.is_primary)?.url || item.listing_images?.[0]?.url || 'https://images.unsplash.com/photo-1512918766675-ed406e3c7432?w=800&fit=crop',
                badges: item.amenities || [],
                isSuperhost: item.host?.is_superhost || false,
                instantBook: item.instant_book,
            }));

            setListings(formatted);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const SidebarFilters = () => (
        <div className="space-y-8 pr-8">
            <div className="md:block hidden">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Search</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        placeholder="Search listings..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Price Range</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 p-2 rounded-lg border border-border bg-card flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Min</span>
                            <span className="text-sm font-mono font-bold">TSh {priceRange[0].toLocaleString()}</span>
                        </div>
                        <div className="flex-1 p-2 rounded-lg border border-border bg-card flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Max</span>
                            <span className="text-sm font-mono font-bold">TSh {priceRange[1].toLocaleString()}</span>
                        </div>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="2000000"
                        step="10000"
                        className="w-full accent-primary"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    />
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Destinations</h3>
                <div className="grid gap-2">
                    {destinations.map((dest) => (
                        <label key={dest.slug} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    className="peer h-5 w-5 rounded-md border-2 border-border transition-all checked:bg-primary checked:border-primary appearance-none cursor-pointer"
                                    checked={selectedDestinations.includes(dest.name)}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedDestinations([...selectedDestinations, dest.name]);
                                        else setSelectedDestinations(selectedDestinations.filter(d => d !== dest.name));
                                    }}
                                />
                                <ChevronDown className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" size={14} />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{dest.name}</span>
                            <span className="ml-auto text-[10px] font-bold text-muted-foreground/50">{destinationStats[dest.name] || 0}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Amenities</h3>
                <div className="grid gap-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                    {filterChips.filter(c => c.label !== 'All' && !['Arusha', 'Zanzibar', 'Kilimanjaro', 'Dodoma'].includes(c.label)).map((chip) => (
                        <label key={chip.label} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    className="peer h-5 w-5 rounded-md border-2 border-border transition-all checked:bg-primary checked:border-primary appearance-none cursor-pointer"
                                    checked={selectedAmenities.includes(chip.label)}
                                    onChange={() => {
                                        if (selectedAmenities.includes(chip.label)) {
                                            setSelectedAmenities(selectedAmenities.filter(a => a !== chip.label));
                                        } else {
                                            setSelectedAmenities([...selectedAmenities, chip.label]);
                                        }
                                    }}
                                />
                                <ChevronDown className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" size={14} />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{chip.label}</span>
                            <span className="ml-auto text-[10px] font-bold text-muted-foreground/50">{amenityStats[chip.label] || 0}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <Navbar />

            <div className="container py-8 md:py-12">
                <div className="flex flex-col md:flex-row gap-10">
                    {/* Sidebar Filters - PC Only */}
                    <aside className="hidden md:block w-72 shrink-0 border-r border-border min-h-[calc(100vh-120px)]">
                        <SidebarFilters />
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="font-display text-3xl font-bold text-primary">Discover Tanzania</h1>
                                <p className="text-muted-foreground mt-1 font-medium">{listings.length} stays found</p>
                            </div>
                            <button
                                onClick={() => setIsFilterOpen(true)}
                                className="md:hidden flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg active:scale-95 transition-transform"
                            >
                                <SlidersHorizontal size={16} /> Filters
                            </button>
                        </div>

                        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-6 mb-2">
                            {filterChips.map((chip) => (
                                <button
                                    key={chip.label}
                                    onClick={() => {
                                        const isDest = ['Arusha', 'Zanzibar', 'Kilimanjaro', 'Dodoma'].includes(chip.label);
                                        if (chip.label === 'All') {
                                            setSelectedAmenities([]);
                                            setSelectedDestinations([]);
                                        } else if (isDest) {
                                            if (selectedDestinations.includes(chip.label)) {
                                                setSelectedDestinations(selectedDestinations.filter(d => d !== chip.label));
                                            } else {
                                                setSelectedDestinations([...selectedDestinations, chip.label]);
                                            }
                                        } else {
                                            if (selectedAmenities.includes(chip.label)) {
                                                setSelectedAmenities(selectedAmenities.filter(a => a !== chip.label));
                                            } else {
                                                setSelectedAmenities([...selectedAmenities, chip.label]);
                                            }
                                        }
                                    }}
                                    className={`shrink-0 rounded-full px-5 py-2 text-[13px] font-bold transition-all border ${(chip.label === 'All' && selectedAmenities.length === 0 && selectedDestinations.length === 0) ||
                                        selectedAmenities.includes(chip.label) ||
                                        selectedDestinations.includes(chip.label)
                                        ? 'bg-primary border-primary text-white shadow-md'
                                        : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'
                                        }`}
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
                            {isLoading ? (
                                Array(9).fill(0).map((_, i) => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="aspect-square w-full rounded-[24px]" />
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ))
                            ) : (
                                listings.map((listing, i) => (
                                    <ListingCard key={listing.id} listing={listing} index={i} />
                                ))
                            )}
                        </div>

                        {!isLoading && listings.length === 0 && (
                            <div className="py-24 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-border mt-8">
                                <MapPin size={48} className="mx-auto text-muted-foreground mb-4" />
                                <p className="text-lg font-bold text-primary">No stays found</p>
                                <p className="text-muted-foreground max-w-xs mx-auto mt-2">Adjust your filters to see more results.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* MOBILE FILTER DRAWER */}
            <AnimatePresence>
                {isFilterOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFilterOpen(false)}
                            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] bg-card p-6 shadow-2xl md:hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-primary">Filters</h2>
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <SidebarFilters />
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="w-full mt-8 rounded-2xl bg-primary py-4 font-bold text-white shadow-lg active:scale-95 transition-transform"
                            >
                                Show Results
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <Footer />
            <MobileNav />
        </div>
    );
};

export default AllListings;
