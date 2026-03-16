import { motion } from 'framer-motion';
import { LayoutDashboard, Home, Calendar, MessageSquare, TrendingUp, Plus, MoreHorizontal, Star } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { sampleListings } from '@/data/sampleData';

const HostDashboard = () => {
    const hostListings = sampleListings.slice(0, 2); // Simulate host's listings

    return (
        <div className="min-h-screen bg-secondary/20 pb-20 md:pb-0">
            <Navbar />

            <main className="container pt-6 md:pt-10">
                <div className="flex flex-col gap-8">
                    {/* Header */}
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h1 className="font-display text-3xl font-bold">Welcome back, Host</h1>
                            <p className="text-muted-foreground">Here's what's happening with your properties today.</p>
                        </div>
                        <Button className="gap-2">
                            <Plus size={18} /> Create new listing
                        </Button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { title: 'Total Revenue', value: 'TSh 1,240,000', change: '+12%', icon: TrendingUp, color: 'text-emerald-500' },
                            { title: 'Active Listings', value: '3', change: '0', icon: Home, color: 'text-blue-500' },
                            { title: 'Bookings', value: '12', change: '+4', icon: Calendar, color: 'text-purple-500' },
                            { title: 'Avg. Rating', value: '4.92', change: '+0.05', icon: Star, color: 'text-amber-500' },
                        ].map((stat, i) => (
                            <Card key={i}>
                                <CardContent className="flex items-center justify-between p-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.title}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                            {stat.change} this month
                                        </p>
                                    </div>
                                    <div className={`rounded-xl bg-secondary p-3 ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Active Listings Table/List */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Your listings</h2>
                                <Button variant="ghost" size="sm">View all</Button>
                            </div>

                            <div className="space-y-4">
                                {hostListings.map((listing) => (
                                    <div key={listing.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-md sm:flex-row sm:items-center">
                                        <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl sm:w-32">
                                            <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                                            <h3 className="truncate font-semibold">{listing.title}</h3>
                                            <p className="text-xs text-muted-foreground">{listing.location}</p>
                                            <div className="mt-2 flex items-center gap-4 text-xs font-medium">
                                                <span className="flex items-center gap-1"><Star size={14} className="fill-amber-400 text-amber-400" /> {listing.rating}</span>
                                                <span className="text-emerald-500">Active</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end gap-2 sm:flex-col sm:items-end">
                                            <p className="font-bold">TSh {listing.price.toLocaleString()}<span className="text-[10px] font-normal text-muted-foreground"> / night</span></p>
                                            <Button variant="outline" size="icon" className="h-8 w-8">
                                                <MoreHorizontal size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Messages/Notifications */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Recent activity</h2>
                            <Card>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border">
                                        {[
                                            { user: 'Samiya M.', action: 'booked your stay', time: '2h ago', property: 'Dhow House' },
                                            { user: 'John D.', action: 'sent a message', time: '5h ago', property: 'Baobab Villa' },
                                            { user: 'Review', action: 'Left 5-star rating', time: '1d ago', property: 'Capitol Hill' },
                                        ].map((activity, i) => (
                                            <div key={i} className="flex gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                                                <div className="h-10 w-10 shrink-0 rounded-full bg-secondary" />
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium">
                                                        <span className="font-bold">{activity.user}</span> {activity.action}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{activity.property} · {activity.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="ghost" className="w-full text-xs py-4">View all notifications</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <MobileNav />
        </div>
    );
};

export default HostDashboard;
