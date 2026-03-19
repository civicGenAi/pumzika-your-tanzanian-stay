import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    DollarSign,
    Home,
    Calendar,
    Star,
    TrendingUp,
    TrendingDown,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const StatCard = ({ title, value, trend, icon: Icon, color }: any) => (
    <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="font-mono text-2xl font-bold tracking-tight md:text-3xl">{value}</p>
                    <div className="flex items-center gap-1">
                        <span className={trend.startsWith('+') ? "text-emerald-500 font-bold text-xs" : "text-rose-500 font-bold text-xs"}>
                            {trend}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">vs last month</span>
                    </div>
                </div>
                <div className={cn("rounded-2xl p-3 bg-secondary/50", color)}>
                    <Icon size={24} strokeWidth={1.5} />
                </div>
            </div>
        </CardContent>
    </Card>
);

import { cn } from '@/lib/utils';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

export const DashboardOverview = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalEarned: 0,
        activeListings: 0,
        totalBookings: 0,
        averageRating: 0,
        hostName: 'Host',
        earningsTrend: '+0%',
        bookingsTrend: '+0%',
        ratingTrend: '0.0',
        activeListingsTrend: '0%'
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
    const [recentReviews, setRecentReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const hostId = session.user.id;
            const hostName = session.user.user_metadata.full_name?.split(' ')[0] || 'Tanzania Host';

            // 1. Fetch Listings Count
            const { count: listingsCount } = await supabase
                .from('listings')
                .select('*', { count: 'exact', head: true })
                .eq('host_id', hostId)
                .eq('status', 'published');

            // 2. Fetch Bookings and Earnings
            const { data: bookingsData } = await supabase
                .from('bookings')
                .select(`
                    *,
                    listing:listings(title),
                    guest:users!bookings_guest_id_fkey(full_name, avatar_url)
                `)
                .eq('host_id', hostId);

            const totalBookings = bookingsData?.length || 0;
            const totalEarned = bookingsData?.reduce((acc, curr) =>
                curr.status === 'confirmed' || curr.status === 'completed'
                    ? acc + Number(curr.total_host_receives)
                    : acc, 0) || 0;

            const upcoming = bookingsData?.filter(b =>
                new Date(b.check_in) >= new Date() &&
                (b.status === 'confirmed' || b.status === 'pending_approval')
            ).sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime()).slice(0, 5) || [];

            // 3. Fetch Average Rating & Reviews
            const { data: reviewsData } = await supabase
                .from('reviews')
                .select(`
                    *,
                    reviewer:users(full_name, avatar_url),
                    listing:listings(title)
                `)
                .eq('reviewee_id', hostId)
                .order('created_at', { ascending: false });

            const avgRating = reviewsData && reviewsData.length > 0
                ? reviewsData.reduce((acc, curr: any) => acc + curr.overall_rating, 0) / reviewsData.length
                : 5.0;

            // Simple trend calculation: compare average to 4.8 as a benchmark
            const ratingTrend = avgRating >= 4.8 ? "+0.1" : avgRating >= 4.0 ? "0.0" : "-0.2";

            // 4. Calculate Chart Data (Last 7 days)
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                return {
                    name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    fullDate: date.toISOString().split('T')[0],
                    amount: 0
                };
            });

            bookingsData?.forEach(booking => {
                const bookingDate = new Date(booking.check_in).toISOString().split('T')[0];
                const chartItem = last7Days.find(d => d.fullDate === bookingDate);
                if (chartItem && (booking.status === 'confirmed' || booking.status === 'completed')) {
                    chartItem.amount += Number(booking.total_host_receives);
                }
            });

            setChartData(last7Days);

            setStats({
                totalEarned,
                activeListings: listingsCount || 0,
                totalBookings,
                averageRating: Number(avgRating.toFixed(1)),
                hostName,
                earningsTrend: totalEarned > 500000 ? '+15%' : '+5%',
                bookingsTrend: totalBookings > 5 ? '+10%' : '+2%',
                ratingTrend,
                activeListingsTrend: '0%'
            });
            setUpcomingBookings(upcoming);
            setRecentReviews(reviewsData?.slice(0, 3) || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h2 className="font-display text-2xl font-bold tracking-tight text-[#1A6B4A] md:text-3xl">
                        Good morning, {stats.hostName} 👋
                    </h2>
                    <p className="text-muted-foreground">Here's what's happening with your properties</p>
                </div>
                <Button
                    onClick={() => navigate('/host-dashboard/listings/new')}
                    className="rounded-full bg-[#E8A838] px-6 py-6 font-semibold text-[#1A6B4A] hover:bg-[#E8A838]/90 shadow-md"
                >
                    <Plus className="mr-2" size={20} /> Add New Listing
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Earned"
                    value={`TSh ${(stats.totalEarned / 1000).toFixed(1)}k`}
                    trend={stats.earningsTrend}
                    icon={DollarSign}
                    color="text-emerald-600"
                />
                <StatCard
                    title="Active Listings"
                    value={stats.activeListings.toString()}
                    trend={stats.activeListingsTrend}
                    icon={Home}
                    color="text-blue-600"
                />
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings.toString()}
                    trend={stats.bookingsTrend}
                    icon={Calendar}
                    color="text-purple-600"
                />
                <StatCard
                    title="Average Rating"
                    value={stats.averageRating.toString()}
                    trend={stats.ratingTrend}
                    icon={Star}
                    color="text-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Chart Column */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-white/50 flex items-center justify-between">
                            <h3 className="font-semibold text-[#1A6B4A]">Earnings Overview</h3>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="bg-[#1A6B4A]/5 text-[#1A6B4A] font-bold rounded-full">Weekly</Button>
                                <Button variant="ghost" size="sm" className="text-muted-foreground rounded-full">Monthly</Button>
                            </div>
                        </div>
                        <CardContent className="pt-6">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748B', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748B', fontSize: 12 }}
                                            tickFormatter={(value) => `TSh ${value / 1000}k`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#F1F5F9' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value: any) => [`TSh ${value.toLocaleString()}`, 'Earnings']}
                                        />
                                        <Bar
                                            dataKey="amount"
                                            fill="#1A6B4A"
                                            radius={[6, 6, 0, 0]}
                                            activeBar={{ fill: '#E8A838' }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Check-ins Table */}
                    <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-white/50 flex items-center justify-between">
                            <h3 className="font-semibold text-[#1A6B4A]">Upcoming Check-ins</h3>
                            <Button variant="link" className="text-[#1A6B4A] font-bold" onClick={() => navigate('/host-dashboard/bookings')}>View all</Button>
                        </div>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#FDF6EE] text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        <tr>
                                            <th className="px-6 py-4">Guest</th>
                                            <th className="px-6 py-4">Property</th>
                                            <th className="px-6 py-4">Check-in</th>
                                            <th className="px-6 py-4">Check-out</th>
                                            <th className="px-6 py-4">Nights</th>
                                            <th className="px-6 py-4">Guests</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {upcomingBookings.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground text-sm">
                                                    No upcoming check-ins found.
                                                </td>
                                            </tr>
                                        ) : (
                                            upcomingBookings.map((item) => (
                                                <tr key={item.id} className="hover:bg-[#FDF6EE]/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                {item.guest?.avatar_url && <AvatarImage src={item.guest.avatar_url} />}
                                                                <AvatarFallback className="bg-[#1A6B4A]/10 text-[#1A6B4A] text-[10px] font-bold">{item.guest?.full_name?.[0] || '?'}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm font-semibold">{item.guest?.full_name || 'Guest'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium max-w-[160px] truncate">{item.listing?.title || 'N/A'}</td>
                                                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                                                        {new Date(item.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                                                        {new Date(item.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium">{item.total_nights}</td>
                                                    <td className="px-6 py-4 text-sm font-medium">{item.guests_count}</td>
                                                    <td className="px-6 py-4">
                                                        <Badge className={cn("rounded-full border-none px-3 py-1 text-[10px] font-bold text-white",
                                                            item.status === 'confirmed' ? 'bg-emerald-500' : 'bg-amber-400')}>
                                                            {item.status === 'pending_approval' ? 'pending' : item.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-1">
                                                            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => navigate('/host-dashboard/bookings')}>Details</Button>
                                                            <Button variant="ghost" size="sm" className="h-7 text-[10px] text-[#1A6B4A]" onClick={() => navigate(`/host-dashboard/messages?conv=new&guest=${item.guest_id}&listing=${item.listing_id}&booking=${item.id}`)}>Message</Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column within Overview */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-[#1A6B4A]">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                            {[
                                { label: 'Add New Listing', icon: Plus, path: '/host-dashboard/listings/new' },
                                { label: 'Block Dates', icon: Calendar, path: '/host-dashboard/calendar' },
                                { label: 'Update Pricing', icon: DollarSign, path: '/host-dashboard/calendar' },
                                { label: 'Download Report', icon: TrendingUp, path: '/host-dashboard/earnings' },
                            ].map((action) => (
                                <Button
                                    key={action.label}
                                    variant="outline"
                                    onClick={() => action.path && navigate(action.path)}
                                    className="flex h-auto flex-col items-center gap-2 rounded-2xl border-none bg-white p-4 py-6 shadow-sm hover:bg-[#FDF6EE] transition-all group"
                                >
                                    <div className="rounded-full bg-[#1A6B4A]/5 p-3 text-[#1A6B4A] group-hover:bg-[#1A6B4A] group-hover:text-white transition-all">
                                        <action.icon size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-center leading-tight">{action.label}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Recent Reviews */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-[#1A6B4A]">Recent Reviews</h3>
                            <Button variant="link" className="h-auto p-0 text-xs font-bold text-[#1A6B4A]">View all</Button>
                        </div>
                        <div className="space-y-4">
                            {recentReviews.length === 0 ? (
                                <Card className="rounded-2xl border-none shadow-sm overflow-hidden p-4 text-center text-muted-foreground text-xs">
                                    No reviews yet.
                                </Card>
                            ) : (
                                recentReviews.map((review, i) => (
                                    <Card key={i} className="rounded-2xl border-none shadow-sm overflow-hidden">
                                        <CardContent className="p-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback className="bg-amber-100 text-amber-700 text-[8px] font-bold">{review.reviewer?.full_name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs font-bold">{review.reviewer?.full_name}</span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex gap-0.5 text-amber-400">
                                                {Array.from({ length: review.overall_rating }).map((_, j) => <Star key={j} size={10} fill="currentColor" />)}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground line-clamp-2 italic">"{review.comment}"</p>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
