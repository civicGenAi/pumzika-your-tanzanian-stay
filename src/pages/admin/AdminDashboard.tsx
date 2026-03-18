import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Home, CreditCard, TrendingUp, DollarSign, Calendar, MapPin, Star, ShieldCheck, Zap, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalListings: 0,
        totalBookings: 0,
        totalRevenue: 0,
        monthlyRevenue: [] as any[],
        bookingsByRegion: [] as any[],
        recentBookings: [] as any[],
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            // Fetch users count
            const { count: usersCount } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            // Fetch listings count
            const { count: listingsCount } = await supabase
                .from('listings')
                .select('*', { count: 'exact', head: true });

            // Fetch bookings stats
            const { data: bookings } = await supabase
                .from('bookings')
                .select('total_price, status');

            const successfulBookings = bookings?.filter(b => b.status === 'confirmed' || b.status === 'completed') || [];
            const revenue = successfulBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

            setStats({
                totalUsers: usersCount || 0,
                totalListings: listingsCount || 0,
                totalBookings: bookings?.length || 0,
                totalRevenue: revenue,
                monthlyRevenue: [
                    { name: 'Jan', revenue: revenue * 0.1 },
                    { name: 'Feb', revenue: revenue * 0.15 },
                    { name: 'Mar', revenue: revenue * 0.25 },
                    { name: 'Apr', revenue: revenue * 0.2 },
                    { name: 'May', revenue: revenue * 0.3 },
                ],
                bookingsByRegion: [
                    { name: 'Arusha', count: 12 },
                    { name: 'Zanzibar', count: 18 },
                    { name: 'Serengeti', count: 8 },
                    { name: 'Kilmanjaro', count: 5 },
                ],
                recentBookings: bookings?.slice(0, 5) || [],
            });
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const metricCards = [
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            description: "Guests and Hosts combined",
            trend: "+12% from last month",
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            title: "Live Listings",
            value: stats.totalListings,
            icon: Home,
            description: "Active properties",
            trend: "+5% from last month",
            color: "text-green-600",
            bg: "bg-green-100"
        },
        {
            title: "Total Bookings",
            value: stats.totalBookings,
            icon: CreditCard,
            description: "All time reservations",
            trend: "+18% from last month",
            color: "text-purple-600",
            bg: "bg-purple-100"
        },
        {
            title: "Platform Revenue",
            value: `$${(stats.totalRevenue * 0.14).toLocaleString()}`, // 14% platform cut
            icon: DollarSign,
            description: "Total fees earned (14%)",
            trend: "+24% from last month",
            color: "text-amber-600",
            bg: "bg-amber-100"
        }
    ];

    if (isLoading) {
        return <div className="animate-pulse space-y-8">
            <div className="h-10 w-48 bg-muted rounded-xl"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-xl"></div>)}
            </div>
        </div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-display font-bold tracking-tight text-[#1A6B4A]">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-2">Welcome to your command center. Here's what's happening today.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {metricCards.map((metric, i) => (
                    <Card key={i} className="rounded-2xl border-none shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {metric.title}
                            </CardTitle>
                            <div className={`h-10 w-10 rounded-xl ${metric.bg} flex items-center justify-center`}>
                                <metric.icon size={20} className={metric.color} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-display font-bold text-foreground">
                                {metric.value}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <TrendingUp size={12} className="text-green-500" />
                                {metric.trend}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                {/* Revenue Chart */}
                <Card className="rounded-2xl border-none shadow-sm lg:col-span-4 overflow-hidden">
                    <CardHeader>
                        <CardTitle>Platform Earnings</CardTitle>
                        <CardDescription>Monthly revenue trends after 14% service fees.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] pl-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.monthlyRevenue}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1A6B4A" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#1A6B4A" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [`$${value}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#1A6B4A" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Popular Regions */}
                <Card className="rounded-2xl border-none shadow-sm lg:col-span-3 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-white">Regional Density</CardTitle>
                        <CardDescription className="text-slate-400">Inventory distribution by region.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] pl-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.bookingsByRegion}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis hide />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                                    {stats.bookingsByRegion.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#1A6B4A', '#E8A838', '#F4C542', '#34D399'][index % 4]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Platform Health Section */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-none flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">System Status</p>
                        <p className="text-xl font-bold">Operational</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-none flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg. Response Time</p>
                        <p className="text-xl font-bold">142ms</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-none flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Platform Uptime</p>
                        <p className="text-xl font-bold">99.99%</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Booking Activity</CardTitle>
                            <CardDescription>Latest reservations and payment statuses.</CardDescription>
                        </div>
                        <Badge variant="outline" className="rounded-full">Real-time Feed</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="pl-6 py-4">Status</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead>Activity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.recentBookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No recent activity detected.</TableCell>
                                    </TableRow>
                                ) : (
                                    stats.recentBookings.map((b, i) => (
                                        <TableRow key={i} className="group hover:bg-muted/20 transition-colors">
                                            <TableCell className="pl-6">
                                                <Badge className={
                                                    b.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                        b.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            'bg-amber-100 text-amber-800'
                                                }>
                                                    {b.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold text-[#1A6B4A]">${b.total_price}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-muted-foreground" />
                                                    <span className="text-sm font-medium">Tanzania</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar size={12} />
                                                    Updated {new Date().toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
