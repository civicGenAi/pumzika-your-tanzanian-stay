import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { ListingCard } from '@/components/ListingCard';
import { sampleListings } from '@/data/sampleData';
import { Link } from 'react-router-dom';

const Saved = () => {
    const savedListings = sampleListings.slice(0, 3); // Simulate saved items

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <Navbar />
            <main className="container pt-10">
                <h1 className="font-display text-4xl font-bold tracking-tight">Saved</h1>

                {savedListings.length > 0 ? (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
                        {savedListings.map((listing, i) => (
                            <Link to={`/listing/${listing.id}`} key={listing.id}>
                                <ListingCard listing={listing} index={i} />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center space-y-4">
                        <h2 className="text-xl font-semibold">No saved stays yet</h2>
                        <p className="text-muted-foreground">As you search, click the heart icon to save your favorite places.</p>
                        <Link to="/" className="inline-flex text-primary font-bold hover:underline">Start exploring</Link>
                    </div>
                )}
            </main>
            <Footer />
            <MobileNav />
        </div>
    );
};

export default Saved;
