import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Lock, Plus, Home, Check, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay, isWithinInterval, startOfDay } from 'date-fns';
import { useState, useEffect } from 'react';

export const HostCalendar = () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [listings, setListings] = useState<any[]>([]);
    const [selectedListingId, setSelectedListingId] = useState<string>('');
    const [bookings, setBookings] = useState<any[]>([]);
    const [blockedDates, setBlockedDates] = useState<Date[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedListingId) {
            fetchListingData(selectedListingId);
        }
    }, [selectedListingId]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: listingsData } = await supabase
                .from('listings')
                .select('id, title')
                .eq('host_id', session.user.id);

            if (listingsData && listingsData.length > 0) {
                setListings(listingsData);
                setSelectedListingId(listingsData[0].id);
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchListingData = async (listingId: string) => {
        try {
            // Fetch bookings
            const { data: bookingsData } = await supabase
                .from('bookings')
                .select('*')
                .eq('listing_id', listingId)
                .in('status', ['confirmed', 'active', 'completed']);

            setBookings(bookingsData || []);

            // Fetch blocked dates
            const { data: availabilityData } = await supabase
                .from('listing_availability')
                .select('date')
                .eq('listing_id', listingId)
                .eq('status', 'blocked_by_host');

            setBlockedDates((availabilityData || []).map(d => new Date(d.date)));
        } catch (error) {
            console.error('Error fetching listing data:', error);
        }
    };

    const handleBlockToggle = async () => {
        if (!date || !selectedListingId) return;

        setIsUpdating(true);
        const dateStr = format(date, 'yyyy-MM-dd');
        const isCurrentlyBlocked = blockedDates.some(d => isSameDay(d, date));

        try {
            if (isCurrentlyBlocked) {
                // Unblock
                await supabase
                    .from('listing_availability')
                    .delete()
                    .eq('listing_id', selectedListingId)
                    .eq('date', dateStr)
                    .eq('status', 'blocked_by_host');

                setBlockedDates(prev => prev.filter(d => !isSameDay(d, date)));
                toast.success('Date unblocked');
            } else {
                // Block
                const { error } = await supabase
                    .from('listing_availability')
                    .upsert({
                        listing_id: selectedListingId,
                        date: dateStr,
                        status: 'blocked_by_host'
                    }, { onConflict: 'listing_id, date' });

                if (error) throw error;
                setBlockedDates(prev => [...prev, date]);
                toast.success('Date blocked for stay');
            }
        } catch (error) {
            toast.error('Failed to update availability');
        } finally {
            setIsUpdating(false);
        }
    };

    const modifiers = {
        booked: (day: Date) => bookings.some(b =>
            isWithinInterval(startOfDay(day), {
                start: startOfDay(new Date(b.check_in)),
                end: startOfDay(new Date(b.check_out))
            })
        ),
        blocked: (day: Date) => blockedDates.some(d => isSameDay(day, d))
    };

    const modifiersStyles = {
        booked: { backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 'bold' },
        blocked: { backgroundColor: '#F1F5F9', color: '#64748B', textDecoration: 'line-through' }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#1A6B4A]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 text-foreground">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-[#1A6B4A]">Calendar</h2>
                    <p className="text-muted-foreground text-sm">Manage your property availability and pricing calendar.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={selectedListingId} onValueChange={setSelectedListingId}>
                        <SelectTrigger className="w-[280px] rounded-xl border-none shadow-sm bg-white h-11">
                            <Home size={18} className="mr-2 text-[#1A6B4A]" />
                            <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-xl">
                            {listings.map(l => (
                                <SelectItem key={l.id} value={l.id} className="rounded-xl">{l.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleBlockToggle} disabled={!date || isUpdating} variant="outline" className="rounded-xl border-none shadow-sm gap-2 h-11 bg-white hover:bg-slate-50">
                        {isUpdating ? <Loader2 className="animate-spin" size={18} /> : (blockedDates.some(d => date && isSameDay(d, date)) ? <Check size={18} /> : <Lock size={18} />)}
                        {blockedDates.some(d => date && isSameDay(d, date)) ? 'Unblock Date' : 'Block Selected'}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm overflow-hidden min-h-[500px] bg-white">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-[#1A6B4A] flex items-center gap-2">
                                <CalendarIcon size={20} className="text-[#E8A838]" /> Availability Calendar
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Live Updates</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center p-4 rounded-[32px] bg-slate-50/50 border border-slate-100">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                modifiers={modifiers}
                                modifiersStyles={modifiersStyles}
                                className="rounded-xl border-none"
                                classNames={{
                                    day_selected: "bg-[#1A6B4A] text-white hover:bg-[#1A6B4A] hover:text-white focus:bg-[#1A6B4A] focus:text-white rounded-xl shadow-lg ring-4 ring-[#1A6B4A]/10",
                                    day_today: "border-2 border-[#E8A838] text-[#1A6B4A] font-bold",
                                    day: "h-12 w-12 md:h-14 md:w-14 text-base transition-all hover:bg-[#1A6B4A]/5 hover:rounded-xl",
                                    caption: "flex justify-center pt-1 relative items-center mb-8",
                                    caption_label: "text-xl font-display font-bold text-[#1A6B4A]",
                                    nav: "flex items-center gap-1",
                                    nav_button: cn(
                                        "h-9 w-9 bg-white p-0 opacity-100 hover:opacity-100 rounded-full border border-border shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
                                    ),
                                    table: "w-full border-collapse space-y-1",
                                    head_cell: "text-muted-foreground rounded-md w-12 md:w-14 font-bold text-[10px] uppercase tracking-[2px] mb-4",
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-[#1A6B4A] text-white relative">
                        <div className="absolute top-0 right-0 h-32 w-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="p-8 relative z-10">
                            <h4 className="text-xl font-display font-bold flex items-center gap-3">
                                <Lock size={20} className="text-[#E8A838]" /> Date Status
                            </h4>
                            <div className="mt-8 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                                {date ? (
                                    <div className="space-y-4">
                                        <p className="text-sm font-medium text-white/70">Selected Date</p>
                                        <p className="text-2xl font-bold">{format(date, 'MMMM d, yyyy')}</p>
                                        <Badge className={cn("rounded-full px-4 py-1 border-none shadow-sm",
                                            modifiers.booked(date) ? 'bg-rose-500 text-white' :
                                                modifiers.blocked(date) ? 'bg-slate-400 text-white' : 'bg-emerald-500 text-white')}>
                                            {modifiers.booked(date) ? 'Booked' : modifiers.blocked(date) ? 'Blocked' : 'Available'}
                                        </Badge>
                                    </div>
                                ) : (
                                    <p className="text-white/60 text-sm">Select a date to manage availability</p>
                                )}
                            </div>
                            <p className="text-xs text-white/50 mt-6 leading-relaxed bg-[#1A6B4A]/30 p-4 rounded-xl border border-white/5">
                                Tip: Blocked dates will not appear in search results for those specific nights.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
                        <CardContent className="p-8">
                            <h4 className="font-bold text-[#1A6B4A] flex items-center gap-2">
                                <Info size={18} className="text-[#E8A838]" /> Calendar Legend
                            </h4>
                            <div className="mt-6 space-y-4">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-4 w-4 rounded-lg bg-emerald-500 shadow-sm shadow-emerald-500/20" />
                                        <span className="text-sm font-semibold text-slate-600">Available</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">Open</span>
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-4 w-4 rounded-lg bg-[#FEE2E2] border border-rose-200" />
                                        <span className="text-sm font-semibold text-slate-600">Confirmed Booking</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded">Booked</span>
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-4 w-4 rounded-lg bg-slate-100 border border-slate-200" />
                                        <span className="text-sm font-semibold text-slate-600">Manually Blocked</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded">Hidden</span>
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-4 w-4 rounded-lg bg-[#1A6B4A] shadow-md shadow-[#1A6B4A]/20" />
                                        <span className="text-sm font-semibold text-slate-600">Currently Selected</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#1A6B4A] uppercase tracking-widest bg-[#1A6B4A]/5 px-2 py-0.5 rounded">Active</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
