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

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeFilter = searchParams.get('category') || 'All';
  const where = searchParams.get('location') || '';
  const when = searchParams.get('dates') || '';
  const who = searchParams.get('guests') || '';

  const [showAll, setShowAll] = useState(false);
  const [listings, setListings] = useState<ListingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const updateFilter = (category: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All' || category === activeFilter) {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams);
  };

  const updateSearch = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  useEffect(() => {
    fetchListings();
  }, [activeFilter, where]); // Re-fetch on filter change

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

      // Simple filtering (can expand later)
      if (activeFilter !== 'All') {
        const isDestination = destinations.some(d => d.name === activeFilter);
        if (isDestination) {
          query = query.eq('destination', activeFilter.toLowerCase());
        } else {
          // Check amenities
          query = query.contains('amenities', [activeFilter]);
        }
      }

      if (where) {
        query = query.ilike('region', `%${where}%`);
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
        description: item.description
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

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/40 px-4 pb-12 pt-10 md:pb-20 md:pt-16">
        {/* Bokeh */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-bokeh absolute left-[10%] top-[20%] h-32 w-32 rounded-full bg-primary/10" />
          <div className="animate-bokeh-delayed absolute right-[15%] top-[30%] h-24 w-24 rounded-full bg-accent/15" />
          <div className="animate-bokeh-slow absolute bottom-[20%] left-[50%] h-20 w-20 rounded-full bg-primary/8" />
        </div>

        <div className="container relative">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.h1
              variants={fadeUp}
              className="font-display text-3xl font-bold tracking-tight text-foreground text-balance md:text-6xl"
              style={{ letterSpacing: '-0.02em' }}
            >
              Find your perfect stay in Tanzania
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-4 max-w-lg text-base text-muted-foreground md:text-lg"
            >
              From Zanzibar's shores to Kilimanjaro's foothills
            </motion.p>
            <motion.div variants={fadeUp} className="mx-auto mt-8 flex justify-center">
              <SearchPill
                variant="hero"
                where={where}
                setWhere={(val) => updateSearch('location', val)}
                when={when}
                setWhen={(val) => updateSearch('dates', val)}
                who={who}
                setWho={(val) => updateSearch('guests', val)}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FILTER CHIPS */}
      <section className="border-b border-border bg-card">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4 py-3 md:container md:justify-center md:gap-3 md:py-4">
          {filterChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => updateFilter(chip.label)}
              className={`shrink-0 rounded-pill px-4 py-2 text-sm font-medium transition-all ${activeFilter === chip.label
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border border-border bg-card text-foreground hover:bg-secondary'
                }`}
            >
              {chip.emoji && <span className="mr-1.5">{chip.emoji}</span>}
              {chip.label}
            </button>
          ))}
        </div>
      </section>

      {/* POPULAR STAYS */}
      <section className="container py-10 md:py-16">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl font-semibold text-foreground md:text-3xl"
        >
          Popular stays
        </motion.h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            displayed.map((listing, i) => (
              <Link to={`/listing/${listing.id}`} key={listing.id}>
                <ListingCard listing={listing} index={i} />
              </Link>
            ))
          )}
        </div>

        {!showAll && listings.length > 8 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="rounded-pill border border-foreground px-8 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Show more
            </button>
          </div>
        )}

        {!isLoading && listings.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">No stays found in this category. Try a different filter.</p>
          </div>
        )}
      </section>

      {/* EXPLORE DESTINATIONS */}
      <section className="container py-10 md:py-16">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl font-semibold text-foreground md:text-3xl"
        >
          Explore Tanzania's finest
        </motion.h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {destinations.map((dest, i) => (
            <DestinationCard key={dest.slug} {...dest} index={i} />
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
