import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, User, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const HostBookings = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    listing:listings(title, region, destination),
                    guest:users!bookings_guest_id_fkey(full_name, avatar_url)
                `)
                .eq('host_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
            case 'completed': return 'bg-blue-500/10 text-blue-600 border-blue-200';
            case 'pending_approval': return 'bg-amber-500/10 text-amber-600 border-amber-200';
            case 'cancelled': return 'bg-rose-500/10 text-rose-600 border-rose-200';
            default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle2 size={14} />;
            case 'pending_approval': return <Clock size={14} />;
            case 'cancelled': return <AlertCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-[#1A6B4A]">Bookings</h2>
                <p className="text-muted-foreground text-sm">Review and manage your guest reservations.</p>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input placeholder="Find a guest or property..." className="pl-10 rounded-xl border-none shadow-sm focus-visible:ring-primary" />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-none shadow-sm gap-2">
                        <Filter size={18} /> Filters
                    </Button>
                    <Button variant="outline" className="rounded-xl border-none shadow-sm gap-2">
                        <Calendar size={18} /> Date Range
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                    ))}
                </div>
            ) : bookings.length > 0 ? (
                <div className="grid gap-4">
                    {bookings.map((booking) => (
                        <Card key={booking.id} className="overflow-hidden rounded-2xl border-none shadow-sm transition-all hover:shadow-md">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center gap-6">
                                        <div className="flex items-center gap-4 min-w-[200px]">
                                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                    {booking.guest?.full_name?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-[#1A6B4A]">{booking.guest?.full_name}</p>
                                                <p className="text-xs text-muted-foreground">Guest ID: {booking.id.slice(0, 8)}</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-semibold flex items-center gap-2">
                                                <MapPin size={14} className="text-muted-foreground" />
                                                {booking.listing?.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {booking.listing?.region}, {booking.listing?.destination}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-1 md:text-right min-w-[150px]">
                                            <p className="text-sm font-bold">
                                                {new Date(booking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(booking.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{booking.total_nights} nights · {booking.total_guests} guests</p>
                                        </div>
                                    </div>

                                    <div className="bg-[#FDF6EE]/50 md:w-56 p-6 flex flex-col justify-center border-t md:border-t-0 md:border-l border-border">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                                            <Badge className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-bold shadow-none", getStatusStyles(booking.status))}>
                                                <span className="flex items-center gap-1">
                                                    {getStatusIcon(booking.status)}
                                                    {booking.status}
                                                </span>
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</span>
                                            <span className="font-mono text-sm font-bold text-[#1A6B4A]">TSh {Number(booking.total_host_receives).toLocaleString()}</span>
                                        </div>
                                        <div className="mt-6 flex gap-2">
                                            <Button size="sm" variant="ghost" className="flex-1 h-8 text-[10px] rounded-full">Details</Button>
                                            <Button size="sm" variant="outline" className="flex-1 h-8 text-[10px] rounded-full">Message</Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                    <p className="text-muted-foreground">No bookings found yet.</p>
                </div>
            )}
        </div>
    );
};

const cn = (...inputs: any) => inputs.filter(Boolean).join(' ');
