import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, User, CheckCircle2, Clock, AlertCircle, Phone, Mail, MessageSquare, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

export const HostBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<any[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
            setFilteredBookings(data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const filtered = bookings.filter(b =>
            b.guest?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.id.includes(searchQuery)
        );
        setFilteredBookings(filtered);
    }, [searchQuery, bookings]);

    const handleMessageGuest = (booking: any) => {
        // Redirect to inbox with this booking context
        navigate(`/host-dashboard/messages?conv=new&guest=${booking.guest_id}&listing=${booking.listing_id}&booking=${booking.id}`);
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
                    <Input
                        placeholder="Find a guest or property..."
                        className="pl-10 rounded-xl border-none shadow-sm focus-visible:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
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
            ) : filteredBookings.length > 0 ? (
                <div className="grid gap-4">
                    {filteredBookings.map((booking) => (
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
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="flex-1 h-8 text-[10px] rounded-full hover:bg-[#1A6B4A]/5 hover:text-[#1A6B4A]"
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setIsDetailsOpen(true);
                                                }}
                                            >
                                                Details
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 h-8 text-[10px] rounded-full border-[#1A6B4A]/20 text-[#1A6B4A]"
                                                onClick={() => handleMessageGuest(booking)}
                                            >
                                                Message
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border-2 border-dashed border-border/50">
                    <p className="text-muted-foreground font-medium">No bookings found yet.</p>
                </div>
            )}

            {/* Booking Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                    {selectedBooking && (
                        <>
                            <div className="sr-only">
                                <DialogTitle>Booking Details for {selectedBooking.guest?.full_name}</DialogTitle>
                                <DialogDescription>Review guest information and reservation details.</DialogDescription>
                            </div>
                            <div className="bg-[#1A6B4A] p-8 text-white relative">
                                <div className="absolute right-0 top-0 h-32 w-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10 flex items-center gap-6">
                                    <Avatar className="h-20 w-20 border-4 border-white/20 shadow-xl">
                                        <AvatarImage src={selectedBooking.guest?.avatar_url} />
                                        <AvatarFallback className="bg-white text-[#1A6B4A] text-2xl font-bold">
                                            {selectedBooking.guest?.full_name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <Badge className="bg-white/20 text-white border-none text-[10px] uppercase tracking-widest px-2 py-0.5 mb-2 hover:bg-white/30">
                                            Reservation #{selectedBooking.id.slice(0, 8)}
                                        </Badge>
                                        <h2 className="text-3xl font-display font-bold leading-tight">{selectedBooking.guest?.full_name}</h2>
                                        <p className="text-white/70 font-medium">Guest since 2024</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1A6B4A]">Contact Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground group">
                                                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-[#1A6B4A] flex items-center justify-center group-hover:bg-[#1A6B4A] group-hover:text-white transition-colors">
                                                    <Mail size={14} />
                                                </div>
                                                <span className="font-medium">contact@guest.com</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground group">
                                                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-[#1A6B4A] flex items-center justify-center group-hover:bg-[#1A6B4A] group-hover:text-white transition-colors">
                                                    <Phone size={14} />
                                                </div>
                                                <span className="font-medium">+255 700 000 000</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1A6B4A]">Booking Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar size={14} className="text-[#E8A838]" />
                                                <span className="font-bold">
                                                    {new Date(selectedBooking.check_in).toLocaleDateString()} - {new Date(selectedBooking.check_out).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <User size={14} />
                                                <span className="font-medium">{selectedBooking.total_guests} Guests · {selectedBooking.total_nights} Nights</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-border/50" />

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1A6B4A]">Listing Information</h3>
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-border/50">
                                        <div className="h-14 w-14 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#1A6B4A]">
                                            <Info size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#1A6B4A]">{selectedBooking.listing?.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{selectedBooking.listing?.region}, {selectedBooking.listing?.destination}</p>
                                        </div>
                                    </div>
                                </div>

                                {selectedBooking.special_requests && (
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#1A6B4A]">Message from Guest</h3>
                                        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-sm italic text-muted-foreground">
                                            "{selectedBooking.special_requests}"
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="p-6 bg-slate-50/50 flex gap-3 border-t border-border/50">
                                <Button variant="ghost" onClick={() => setIsDetailsOpen(false)} className="rounded-full">Close</Button>
                                <Button
                                    className="rounded-full bg-[#1A6B4A] text-white hover:bg-[#1A6B4A]/90 gap-2 shadow-lg h-11 px-8"
                                    onClick={() => {
                                        setIsDetailsOpen(false);
                                        handleMessageGuest(selectedBooking);
                                    }}
                                >
                                    <MessageSquare size={16} /> Message {selectedBooking.guest?.full_name?.split(' ')[0]}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

const cn = (...inputs: any) => inputs.filter(Boolean).join(' ');
