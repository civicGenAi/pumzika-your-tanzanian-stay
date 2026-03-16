import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sampleListings } from '@/data/sampleData';

const Trips = () => {
    const trips = [
        { ...sampleListings[0], status: 'Upcoming', dates: 'Mar 24 - 29, 2024' },
        { ...sampleListings[2], status: 'Past', dates: 'Jan 12 - 15, 2024' },
    ];

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <Navbar />
            <main className="container pt-10">
                <h1 className="font-display text-4xl font-bold tracking-tight">Trips</h1>

                <div className="mt-10 space-y-12">
                    {trips.length > 0 ? (
                        trips.map((trip, i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="relative w-full md:w-64 h-48 rounded-2xl overflow-hidden shrink-0">
                                    <img src={trip.image} alt={trip.title} className="w-full h-full object-cover" />
                                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${trip.status === 'Upcoming' ? 'bg-emerald-500/90 text-white' : 'bg-secondary/90'}`}>
                                        {trip.status}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">{trip.title}</h2>
                                        <p className="text-muted-foreground">{trip.location}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-6 text-sm">
                                        <div className="flex items-center gap-2"><Calendar size={18} className="text-primary" /> {trip.dates}</div>
                                        <div className="flex items-center gap-2"><MapPin size={18} className="text-primary" /> {trip.city}</div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="outline">View itinerary</Button>
                                        <Button variant="ghost">Message host</Button>
                                    </div>
                                </div>
                            </div>
                        )
                        )) : (
                        <div className="py-20 text-center border-t border-border">
                            <p className="text-lg text-muted-foreground">No trips booked yet.</p>
                            <Button className="mt-4" asChild><Link to="/">Explore Tanzania</Link></Button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
            <MobileNav />
        </div>
    );
};

export default Trips;
