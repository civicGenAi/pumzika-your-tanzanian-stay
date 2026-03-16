import { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { HostSidebar } from '@/components/HostSidebar';
import { HostHeader } from '@/components/HostHeader';
import { DashboardOverview } from '@/components/DashboardOverview';
import { HostListings } from '@/components/HostListings';
import { HostBookings } from '@/components/HostBookings';
import { HostEarnings } from '@/components/HostEarnings';
import { HostReviews } from '@/components/HostReviews';
import { HostCalendar } from '@/components/HostCalendar';
import { HostSettings } from '@/components/HostSettings';
import { StateFeedback } from '@/components/StateFeedback';

const HostDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate initial dashboard load
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex min-h-screen bg-[#FDF6EE]">
            {/* Sidebar */}
            <HostSidebar />

            {/* Main Content Area */}
            <main className="flex-1 transition-all duration-300 md:ml-[260px]">
                <HostHeader />

                <div className="container max-w-7xl px-4 py-8 md:px-8 md:py-10">
                    {isLoading ? (
                        <StateFeedback type="loading" />
                    ) : (
                        <Routes>
                            <Route index element={<DashboardOverview />} />
                            <Route path="listings" element={<HostListings />} />
                            <Route path="bookings" element={<HostBookings />} />
                            <Route path="earnings" element={<HostEarnings />} />
                            <Route path="reviews" element={<HostReviews />} />
                            <Route path="calendar" element={<HostCalendar />} />
                            <Route path="settings" element={<HostSettings />} />
                            <Route path="messages" element={<div className="p-8 text-center bg-white rounded-2xl shadow-sm"><h2 className="text-2xl font-bold text-[#1A6B4A]">Messages</h2><p className="text-muted-foreground mt-2">Communicate with your guests. Integrated with Global Inbox.</p></div>} />
                        </Routes>
                    )}
                </div>
            </main>
        </div>
    );
};

export default HostDashboard;
