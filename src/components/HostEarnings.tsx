import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const HostEarnings = () => {
    const [stats, setStats] = useState({
        totalEarnings: 0,
        pendingPayouts: 0,
        completedBookings: 0,
        averageBookingValue: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: bookings, error } = await supabase
                .from('bookings')
                .select('total_host_receives, status, created_at')
                .eq('host_id', session.user.id);

            if (error) throw error;

            const completed = bookings?.filter(b => b.status === 'completed') || [];
            const total = completed.reduce((sum, b) => sum + Number(b.total_host_receives), 0);
            const pending = bookings?.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + Number(b.total_host_receives), 0) || 0;

            setStats({
                totalEarnings: total,
                pendingPayouts: pending,
                completedBookings: completed.length,
                averageBookingValue: completed.length ? total / completed.length : 0
            });

            // Basic chart data grouping by month
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const grouped = completed.reduce((acc: any, b) => {
                const month = months[new Date(b.created_at).getMonth()];
                acc[month] = (acc[month] || 0) + Number(b.total_host_receives);
                return acc;
            }, {});

            setChartData(months.map(m => ({ name: m, amount: grouped[m] || 0 })));
        } catch (error) {
            console.error('Error fetching earnings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-[#1A6B4A]">Earnings</h2>
                    <p className="text-muted-foreground text-sm">Track your revenue and financial performance.</p>
                </div>
                <Button variant="outline" className="rounded-xl border-none shadow-sm gap-2">
                    <Download size={18} /> Export Statement
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Total Earnings', value: `TSh ${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Pending Payouts', value: `TSh ${stats.pendingPayouts.toLocaleString()}`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Total Bookings', value: stats.completedBookings, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Avg. Value', value: `TSh ${Math.round(stats.averageBookingValue).toLocaleString()}`, icon: ArrowUpRight, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-2xl border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className={cn("mb-4 flex h-10 w-10 items-center justify-center rounded-full", stat.bg)}>
                                <stat.icon size={20} className={stat.color} />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                            <h3 className="mt-1 text-xl font-bold text-[#1A6B4A]">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                <CardHeader className="px-8 pt-8">
                    <CardTitle className="text-lg font-bold text-[#1A6B4A]">Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-8 md:px-8">
                    <div className="h-[300px] w-full mt-4">
                        {isLoading ? (
                            <Skeleton className="h-full w-full rounded-xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                                        tickFormatter={(val) => `TSh ${val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : (val / 1000).toFixed(0) + 'K'}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#F1F5F9' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="amount" fill="#1A6B4A" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const cn = (...inputs: any) => inputs.filter(Boolean).join(' ');
