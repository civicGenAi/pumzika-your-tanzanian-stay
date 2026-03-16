import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Heart, Share, Shield, Zap, Calendar } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { sampleListings } from '@/data/sampleData';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const ListingDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setIsCheckingAuth(false);
        });
    }, []);

    const listing = sampleListings.find((l) => l.id === id);

    if (!listing) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">Listing not found</h1>
                <Button onClick={() => navigate('/')} className="mt-4">Go home</Button>
            </div>
        );
    }

    const images = listing.images || [listing.image];

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
                                <span>{listing.rating}</span>
                                <span className="font-normal text-muted-foreground underline">({listing.reviews} reviews)</span>
                            </div>
                            {listing.isSuperhost && (
                                <div className="flex items-center gap-1">
                                    <Shield size={14} />
                                    <span className="font-semibold">Superhost</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1 underline underline-offset-2">
                                <MapPin size={14} />
                                <span className="font-medium">{listing.location}</span>
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
                        {images.slice(1, 5).map((img, i) => (
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
                            className="absolute bottom-4 right-4 bg-background/90 text-xs backdrop-blur-sm md:text-sm"
                            size="sm"
                        >
                            Show all photos
                        </Button>
                    </div>
                </section>

                {/* Content Section */}
                <section className="mt-8 grid grid-cols-1 gap-12 md:mt-12 md:grid-cols-3">
                    {/* Main Info */}
                    <div className="md:col-span-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-display text-xl font-semibold md:text-2xl">
                                    Hosted by {listing.isSuperhost ? 'a Superhost' : 'Pumzika Host'}
                                </h2>
                                <p className="mt-1 text-muted-foreground">
                                    Entire home in {listing.city} · 4 guests · 2 bedrooms · 2 beds · 1 bath
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-secondary" />
                        </div>

                        <Separator className="my-8" />

                        <div className="space-y-6">
                            {listing.isSuperhost && (
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
                            <p className="leading-relaxed text-muted-foreground">
                                {listing.description || "Welcome to our beautiful stay in Tanzania. We provide everything you need for a comfortable and memorable experience."}
                            </p>
                            <Button variant="link" className="p-0 font-semibold underline">Show more</Button>
                        </div>

                        <Separator className="my-8" />

                        {/* Amenities (Placeholder for now) */}
                        <div className="space-y-4">
                            <h3 className="font-display text-xl font-semibold">What this place offers</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {['Wifi', 'Kitchen', 'Free parking', 'Air conditioning', 'Dedicated workspace', 'Beach access'].map((item) => (
                                    <div key={item} className="flex items-center gap-4 text-muted-foreground">
                                        <div className="h-2 w-2 rounded-full bg-primary/40" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="mt-4">Show all 45 amenities</Button>
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div className="relative">
                        <div className="sticky top-28 rounded-2xl border border-border bg-card p-6 shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-xl font-bold md:text-2xl">TSh {listing.price.toLocaleString()}</span>
                                    <span className="text-muted-foreground"> / night</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-semibold">
                                    <Star size={14} className="fill-foreground" />
                                    <span>{listing.rating}</span>
                                </div>
                            </div>

                            <div className="mt-6 space-y-0 rounded-xl border border-border">
                                <div className="grid grid-cols-2 divide-x divide-border">
                                    <button className="flex flex-col p-3 text-left transition-colors hover:bg-muted/50">
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Check-in</span>
                                        <span className="text-sm">Add date</span>
                                    </button>
                                    <button className="flex flex-col p-3 text-left transition-colors hover:bg-muted/50">
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Checkout</span>
                                        <span className="text-sm">Add date</span>
                                    </button>
                                </div>
                                <button className="flex w-full flex-col border-t border-border p-3 text-left transition-colors hover:bg-muted/50">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Guests</span>
                                    <span className="text-sm">1 guest</span>
                                </button>
                            </div>

                            {user ? (
                                <Button className="mt-4 w-full py-6 text-lg font-semibold" size="lg">
                                    Reserve
                                </Button>
                            ) : (
                                <Button
                                    className="mt-4 w-full py-6 text-lg font-semibold bg-[#E8A838] text-[#1A6B4A] hover:bg-[#E8A838]/90"
                                    size="lg"
                                    onClick={() => navigate('/login')}
                                >
                                    Log in to book
                                </Button>
                            )}

                            <p className="mt-4 text-center text-sm text-muted-foreground">
                                You won't be charged yet
                            </p>

                            <div className="mt-6 space-y-3 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span className="underline">TSh {listing.price.toLocaleString()} x 5 nights</span>
                                    <span>TSh {(listing.price * 5).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span className="underline">Cleaning fee</span>
                                    <span>TSh 25,000</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span className="underline">Pumzika service fee</span>
                                    <span>TSh 15,000</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold">
                                    <span>Total before taxes</span>
                                    <span>TSh {(listing.price * 5 + 40000).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <MobileNav />
        </div>
    );
};

export default ListingDetail;
