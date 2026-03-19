import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Compass, Shield, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { SearchPill } from '@/components/SearchPill';
import { ListingCard, ListingData } from '@/components/ListingCard';
import { DestinationCard } from '@/components/DestinationCard';
import { Footer } from '@/components/Footer';
import { destinations, filterChips } from '@/data/sampleData';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

import { fetchDestinationStats, DestinationStat } from '@/lib/discovery';

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const where = searchParams.get('location') || '';
  const when = searchParams.get('dates') || '';
  const who = searchParams.get('guests') || '';

  const [showAll, setShowAll] = useState(false);
  const [listings, setListings] = useState<ListingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dynamicDestinations, setDynamicDestinations] = useState<DestinationStat[]>([]);


  const updateSearch = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  useEffect(() => {
    fetchListings();
    loadDestinations();
  }, [where]); // Re-fetch on location change

  const loadDestinations = async () => {
    const stats = await fetchDestinationStats();
    setDynamicDestinations(stats);
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


      if (where) {
        query = query.ilike('destination', `%${where}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formattedData: ListingData[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        location: `${item.region}, ${item.destination}`,
        city: item.destination,
        price: Number(item.base_price),
        usdPrice: Math.round(Number(item.base_price) / 2600), // Conversion approx
        rating: item.average_rating || 5.0,
        reviews: item.review_count || 0,
        image: item.listing_images?.find((img: any) => img.is_primary)?.url || item.listing_images?.[0]?.url || 'https://images.unsplash.com/photo-1512918766675-ed406e3c7432?w=800&fit=crop',
        badges: item.amenities || [],
        isSuperhost: item.host?.is_superhost || false,
        instantBook: item.instant_book,
        description: item.description,
        verification_status: item.verification_status,
      }));

      setListings(formattedData);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayed = showAll ? listings : listings.slice(0, 8);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />




      {/* DISCOVER SECTION */}
      <section className="container py-10 md:py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-2xl font-bold text-[#1A6B4A] md:text-3xl"
            >
              Discover Tanzanian Heritage
            </motion.h2>
            <p className="text-muted-foreground mt-2 font-medium">Top-rated stays vetted for quality and comfort</p>
          </div>
          <Link to="/explore" className="hidden md:flex items-center gap-2 text-sm font-bold text-primary hover:underline transition-all">
            Show all {listings.length} stays <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[1/1] w-full rounded-[24px]" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            displayed.map((listing, i) => (
              <Link to={`/listing/${listing.id}`} key={listing.id} className="group">
                <ListingCard listing={listing} index={i} />
              </Link>
            ))
          )}
        </div>

        {listings.length > 8 && (
          <div className="mt-12 text-center">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-full bg-[#1A6B4A] px-10 py-4 font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Explore all stays
            </Link>
          </div>
        )}

        {!isLoading && listings.length === 0 && (
          <div className="py-24 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-border">
            <Compass size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-bold text-[#1A6B4A]">No stays found</p>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2">Try a different destination or filter to find your perfect stay.</p>
          </div>
        )}
      </section>

      {/* TOP DESTINATIONS */}
      <section className="container py-12 md:py-20 bg-slate-50/50 rounded-[48px] my-10 border border-slate-100">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-bold text-[#1A6B4A] md:text-4xl"
          >
            Experience the Heart of Tanzania
          </motion.h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">From the spice islands of Zanzibar to the wild plains of Serengeti</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {dynamicDestinations.map((dest, i) => (
            <Link key={dest.slug} to={`/explore?location=${dest.slug}`}>
              <DestinationCard
                name={dest.name}
                count={dest.count}
                image={dest.image}
                slug={dest.slug}
                index={i}
              />
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-card py-12 md:py-20">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-display text-2xl font-semibold text-foreground md:text-3xl"
          >
            How it works
          </motion.h2>
          <div className="relative mt-10 grid gap-8 md:grid-cols-3 md:gap-12">
            {/* Connecting line - desktop only */}
            <div className="absolute left-[16.6%] right-[16.6%] top-8 hidden border-t-2 border-dashed border-border md:block" />

            {[
              { icon: Search, title: 'Search your destination', desc: "Browse hundreds of verified stays across Tanzania's top destinations." },
              { icon: Shield, title: 'Book with confidence', desc: 'Secure payments, verified hosts, and flexible cancellation policies.' },
              { icon: Compass, title: 'Enjoy your stay', desc: 'Check in seamlessly and experience Tanzanian hospitality at its finest.' },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <step.icon size={24} strokeWidth={1.5} className="text-primary" />
                </div>
                <h3 className="mt-4 font-body text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BECOME A HOST BANNER */}
      <section className="container py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl bg-primary px-6 py-10 md:flex md:items-center md:justify-between md:px-12 md:py-14"
        >
          <div className="relative z-10">
            <h2 className="font-display text-2xl font-semibold text-primary-foreground md:text-3xl">
              Turn your space into income
            </h2>
            <p className="mt-2 max-w-md text-sm text-primary-foreground/80">
              Join thousands of hosts across Tanzania and start earning from your property today.
            </p>
          </div>
          <Link
            to="/become-host"
            className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-pill bg-accent px-8 py-3 font-body text-sm font-semibold text-accent-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 md:mt-0"
          >
            Get started
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
          {/* Decorative */}
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary-foreground/5" />
          <div className="absolute -bottom-12 -right-4 h-56 w-56 rounded-full bg-primary-foreground/5" />
        </motion.div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Index;
