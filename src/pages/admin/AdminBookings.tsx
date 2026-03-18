import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, DollarSign, Briefcase, TrendingUp, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { toast } from 'sonner';

const AdminBookings = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({
        totalRevenue: 0,
        platformFees: 0,
        completedBookings: 0
    });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    listing:listings!listing_id(title, host_id),
                    guest:users!guest_id(full_name, email)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const results = data || [];
            setBookings(results);

            // Calculate stats
            const revenue = results.reduce((acc, b) => acc + (b.total_price || 0), 0);
            const fees = results.reduce((acc, b) => acc + ((b.total_price || 0) * 0.14), 0);
            const completed = results.filter(b => b.status === 'completed').length;

            setStats({
                totalRevenue: revenue,
                platformFees: fees,
                completedBookings: completed
            });
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none rounded-full px-3">Completed</Badge>;
            case 'confirmed': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none rounded-full px-3">Confirmed</Badge>;
            case 'pending': return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none rounded-full px-3">Pending Payment</Badge>;
            case 'cancelled': return <Badge variant="destructive" className="border-none rounded-full px-3">Cancelled</Badge>;
            default: return <Badge variant="outline" className="rounded-full px-3">{status}</Badge>;
        }
    };

    const filteredBookings = bookings.filter(b =>
        b.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guest?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight text-[#1A6B4A]">Bookings & Financials</h1>
                    <p className="text-muted-foreground mt-1">Monitor all platform reservations and revenue streams.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                        placeholder="Search reservations..."
                        className="pl-10 bg-card border-border rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-[#1A6B4A] to-[#2D5A27] text-white">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium opacity-80">Total GTV (Gross Transaction Value)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex justify-between items-end">
                        <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                        <TrendingUp size={24} className="opacity-40" />
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm bg-white">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Platform Net Revenue (Fees)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex justify-between items-end">
                        <div className="text-2xl font-bold text-[#1A6B4A]">${stats.platformFees.toLocaleString()}</div>
                        <DollarSign size={24} className="text-[#1A6B4A] opacity-20" />
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm bg-white">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Volume</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex justify-between items-end">
                        <div className="text-2xl font-bold text-[#E8A838]">{bookings.length} Bookings</div>
                        <Briefcase size={24} className="text-[#E8A838] opacity-20" />
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="pl-6 py-4 font-semibold text-foreground">Stay Details</TableHead>
                                <TableHead className="font-semibold text-foreground">Guest</TableHead>
                                <TableHead className="font-semibold text-foreground text-center">Dates</TableHead>
                                <TableHead className="font-semibold text-foreground">Financials</TableHead>
                                <TableHead className="text-right pr-6 font-semibold text-foreground">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                        Loading ledger...
                                    </TableCell>
                                </TableRow>
                            ) : filteredBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                        No bookings found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <TableRow key={booking.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="pl-6 py-4">
                                            <div className="truncate max-w-[200px]">
                                                <div className="flex items-center gap-2 group">
                                                    <p className="font-semibold text-foreground truncate ">{booking.listing?.title}</p>
                                                    <a href={`/listing/${booking.listing_id}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                                        <ExternalLink size={14} />
                                                    </a>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                                    <Clock size={10} /> {format(new Date(booking.created_at), 'HH:mm • dd MMM')}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="truncate max-w-[150px]">
                                                <p className="font-medium text-sm text-foreground">{booking.guest?.full_name}</p>
                                                <p className="text-[10px] text-muted-foreground truncate">{booking.guest?.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <p className="text-xs font-bold text-foreground">{format(new Date(booking.check_in), 'dd MMM')} - {format(new Date(booking.check_out), 'dd MMM')}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{new Date(booking.check_out).getDate() - new Date(booking.check_in).getDate()} Nights</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#1A6B4A]">${booking.total_price}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium">Fee: ${(booking.total_price * 0.14).toFixed(2)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            {getStatusBadge(booking.status)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminBookings;
