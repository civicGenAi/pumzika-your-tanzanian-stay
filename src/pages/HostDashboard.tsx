import { useState, useEffect } from 'react';
import { HostSidebar } from '@/components/HostSidebar';
import { DashboardOverview } from '@/components/DashboardOverview';
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
                {/* Top Spacer for mobile trigger */}
                <div className="h-16 md:hidden" />

                <div className="container max-w-7xl py-8 md:py-12">
                    {isLoading ? (
                        <StateFeedback type="loading" />
                    ) : (
                        <DashboardOverview />
                    )}
                </div>
            </main>
        </div>
    );
};

export default HostDashboard;
