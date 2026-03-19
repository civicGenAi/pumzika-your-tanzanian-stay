import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Compass, Shield, ArrowRight, Phone, Mail, MessageCircle, User, Star, Home, DollarSign } from 'lucide-react';
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
      <section className="bg-white py-12 md:py-24 overflow-hidden">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl font-bold text-[#1A6B4A] md:text-4xl"
            >
              How Pumzika Works
            </motion.h2>
            <p className="text-muted-foreground mt-4 text-lg">Your gateway to authentic Tanzanian stays</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* For Guests */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#FDF6EE] rounded-[40px] p-8 md:p-12 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <User size={120} className="text-[#1A6B4A]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A6B4A] mb-8 flex items-center gap-3">
                <span className="bg-[#1A6B4A] text-white h-8 w-8 rounded-full flex items-center justify-center text-sm">1</span>
                For Guests
              </h3>
              <div className="space-y-8 relative z-10">
                {[
                  { icon: Search, title: 'Find your stay', desc: 'Browse curated listings from Arusha to Zanzibar.' },
                  { icon: Shield, title: 'Secure Booking', desc: 'Pay safely and get instant confirmation.' },
                  { icon: Compass, title: 'Experience Tanzania', desc: 'Enjoy your stay with 24/7 local support.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <item.icon size={20} className="text-[#E8A838]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1A6B4A]">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* For Hosts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-emerald-50 rounded-[40px] p-8 md:p-12 relative overflow-hidden group border border-[#1A6B4A]/5"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Star size={120} className="text-[#1A6B4A]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A6B4A] mb-8 flex items-center gap-3">
                <span className="bg-[#1A6B4A] text-white h-8 w-8 rounded-full flex items-center justify-center text-sm">2</span>
                For Hosts
              </h3>
              <div className="space-y-8 relative z-10">
                {[
                  { icon: Home, title: 'List your space', desc: 'Set your price and share your unique hospitality.' },
                  { icon: Search, title: 'Manage Bookings', desc: 'Use our dashboard to track stays and earnings.' },
                  { icon: DollarSign, title: 'Get Paid', desc: 'Reliable payouts directly to your local bank or mobile wallet.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <item.icon size={20} className="text-[#1A6B4A]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1A6B4A]">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BECOME A HOST BANNER */}
      <section className="container py-10 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[48px] bg-[#1A6B4A] px-8 py-16 md:px-20 md:py-20 shadow-2xl"
        >
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-white md:text-5xl leading-tight">
                Turn your space into income
              </h2>
              <p className="mt-6 text-lg text-white/80 max-w-md">
                Join thousands of hosts across Tanzania and start earning from your property today.
              </p>
              <div className="mt-8 flex flex-col gap-4">
                <Link
                  to="/become-host"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8A838] px-10 py-5 font-bold text-[#1A6B4A] shadow-xl hover:scale-105 transition-all text-lg"
                >
                  Get started as Host
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-[32px] p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6 underline underline-offset-8 decoration-[#E8A838]">Need more information?</h3>
              <div className="space-y-6">
                <a href="mailto:info@pumzika.com" className="flex items-center gap-4 text-white hover:text-[#E8A838] transition-colors group">
                  <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-[#E8A838] group-hover:text-[#1A6B4A] transition-all">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold opacity-60">Email us</p>
                    <p className="font-bold">info@pumzika.com</p>
                  </div>
                </a>
                <a href="https://wa.me/255759234234" target="_blank" className="flex items-center gap-4 text-white hover:text-[#E8A838] transition-colors group">
                  <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-[#E8A838] group-hover:text-[#1A6B4A] transition-all">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold opacity-60">WhatsApp</p>
                    <p className="font-bold">+255 759 234 234</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Decorative shapes */}
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-white/5" />
        </motion.div>
      </section>

      {/* Floating WhatsApp UI */}
      <a
        href="https://wa.me/255759234234"
        target="_blank"
        className="fixed bottom-6 right-6 z-[100] group flex items-center gap-3 md:gap-4"
      >
        <div className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-slate-100 hidden group-hover:block animate-in slide-in-from-right-4 fade-in duration-300">
          <p className="text-xs font-bold text-[#1A6B4A] whitespace-nowrap">Need help? Chat with us</p>
        </div>
        <div className="h-14 w-14 md:h-16 md:w-16 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all">
          <MessageCircle size={32} />
        </div>
      </a>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Index;
