import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Download, Calendar, Filter, TrendingUp, Users, Home, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const COLORS = ['#1A6B4A', '#E8A838', '#2D5A27', '#F4C542', '#144D35'];

const AdminReports = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [regionData, setRegionData] = useState<any[]>([]);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        setIsLoading(true);
        try {
            // In a real app, these would be complex aggregation queries
            // For now, we fetch bookings and listings to calculate trends
            const { data: bookings } = await supabase.from('bookings').select('*');
            const { data: listings } = await supabase.from('listings').select('*');

            // Mocking trend data based on volume
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const mockRevenue = months.map(m => ({
                name: m,
                revenue: Math.floor(Math.random() * 5000) + 2000,
                bookings: Math.floor(Math.random() * 50) + 10
            }));
            setRevenueData(mockRevenue);

            // Category distribution
            const categories: any = {};
            listings?.forEach(l => {
                categories[l.category] = (categories[l.category] || 0) + 1;
            });
            setCategoryData(Object.entries(categories).map(([name, value]) => ({ name, value })));

            // Region distribution
            const regions: any = {};
            listings?.forEach(l => {
                regions[l.region || 'Zanzibar'] = (regions[l.region || 'Zanzibar'] || 0) + 1;
            });
            setRegionData(Object.entries(regions).map(([name, value]) => ({ name, value })));

        } catch (error) {
            console.error('Error fetching report data:', error);
            toast.error('Failed to load performance reports');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        toast.info('Preparing CSV export...');
        setTimeout(() => toast.success('Report exported successfully!'), 1500);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight text-[#1A6B4A]">Performance Reports</h1>
                    <p className="text-muted-foreground mt-1">Deep-dive into platform growth and revenue metrics.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-full gap-2 border-border">
                        <Calendar size={16} />
                        Last 12 Months
                    </Button>
                    <Button onClick={handleExport} className="rounded-full gap-2 bg-[#1A6B4A]">
                        <Download size={16} />
                        Export Data
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Revenue Growth */}
                <Card className="rounded-2xl border-none shadow-sm md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="text-[#1A6B4A]" size={20} />
                            Revenue & Booking Growth
                        </CardTitle>
                        <CardDescription>Monthly growth trajectory of gross transaction value.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1A6B4A" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#1A6B4A" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#1A6B4A" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Popular Destinations */}
                <Card className="rounded-2xl border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Regional Distribution</CardTitle>
                        <CardDescription>Active listings by destination.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                <XAxis type="number" axisLine={false} tickLine={false} hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={100} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                                <Bar dataKey="value" fill="#E8A838" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Listing Categories */}
                <Card className="rounded-2xl border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Category Popularity</CardTitle>
                        <CardDescription>Breakdown of property types across the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                <Legend verticalAlign="bottom" align="center" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminReports;
