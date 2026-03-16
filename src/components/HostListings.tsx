import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

export const HostListings = () => {
    const [listings, setListings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('listings')
                .select('*, listing_images(url, is_primary)')
                .eq('host_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setListings(data || []);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-[#1A6B4A]">My Listings</h2>
                    <p className="text-muted-foreground text-sm">Manage and track your property performances.</p>
                </div>
                <Button className="rounded-full bg-[#E8A838] px-6 py-6 font-semibold text-[#1A6B4A] hover:bg-[#E8A838]/90 shadow-md">
                    <Plus className="mr-2" size={20} /> Create New Listing
                </Button>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input placeholder="Search listings..." className="pl-10 rounded-xl border-none shadow-sm focus-visible:ring-primary" />
                </div>
                <Button variant="outline" className="rounded-xl border-none shadow-sm gap-2">
                    <Filter size={18} /> Filters
                </Button>
            </div>

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array(3).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-64 rounded-2xl" />
                    ))}
                </div>
            ) : listings.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {listings.map((listing) => (
                        <Card key={listing.id} className="group overflow-hidden rounded-2xl border-none shadow-sm transition-all hover:shadow-md">
                            <div className="relative aspect-video overflow-hidden">
                                <img
                                    src={listing.listing_images?.find((img: any) => img.is_primary)?.url || listing.listing_images?.[0]?.url || 'https://images.unsplash.com/photo-1512918766675-ed406e3c7432?w=800&fit=crop'}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    alt={listing.title}
                                />
                                <div className="absolute right-3 top-3">
                                    <Badge className={cn("rounded-full border-none px-3 py-1 text-[10px] font-bold text-white",
                                        listing.status === 'published' ? 'bg-emerald-500' : 'bg-amber-400')}>
                                        {listing.status}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-bold text-[#1A6B4A] line-clamp-1">{listing.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">{listing.region}, {listing.destination}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                        <MoreVertical size={16} />
                                    </Button>
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Price/night</span>
                                        <span className="text-sm font-bold">TSh {Number(listing.base_price).toLocaleString()}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="h-8 w-8 rounded-full p-0">
                                            <Edit size={14} />
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-8 w-8 rounded-full p-0 text-destructive hover:text-destructive">
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm text-center px-6">
                    <div className="h-32 w-32 bg-[#FDF6EE] rounded-full flex items-center justify-center mb-6">
                        <Home size={48} className="text-[#1A6B4A]/40" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A6B4A]">No listings yet</h3>
                    <p className="text-muted-foreground max-w-sm mt-2">Start your hosting journey by creating your first property listing.</p>
                    <Button className="mt-8 rounded-full bg-[#E8A838] px-8 py-6 font-semibold text-[#1A6B4A] hover:bg-[#E8A838]/90">
                        Create Listing
                    </Button>
                </div>
            )}
        </div>
    );
};

const cn = (...inputs: any) => inputs.filter(Boolean).join(' ');
