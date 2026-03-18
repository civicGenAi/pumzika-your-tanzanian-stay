import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { Search, BookOpen, Home, Shield, LifeBuoy, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HelpCenter = () => {
    const categories = [
        { icon: Home, title: "Booking and traveling", description: "Finding a place, booking your trip, and what to expect on the road." },
        { icon: BookOpen, title: "Hosting on Pumzika", description: "How to list your space, manage reservations, and get tips from hosts." },
        { icon: Shield, title: "Safety and security", description: "Your safety is our priority. Learn about how we protect you." },
    ];

    const faqs = [
        "How do I book a stay in Arusha?",
        "What is the cancellation policy?",
        "How do I message my host?",
        "How do I become a host?",
        "Is my payment secure?"
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container max-w-5xl py-12 md:py-20">
                <div className="text-center space-y-6 mb-16">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1A6B4A]">How can we help?</h1>
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <Input
                            placeholder="Search help articles..."
                            className="h-14 pl-12 rounded-full border-border bg-secondary/20 shadow-sm focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3 mb-20">
                    {categories.map((cat, i) => (
                        <div key={i} className="p-8 rounded-[32px] border border-border bg-card hover:shadow-xl transition-all group cursor-pointer">
                            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <cat.icon className="text-primary" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-[#1A6B4A] mb-2">{cat.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{cat.description}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-12">
                    <h2 className="text-2xl font-bold text-[#1A6B4A]">Frequently asked questions</h2>
                    <div className="divide-y divide-border border-y border-border">
                        {faqs.map((faq, i) => (
                            <button key={i} className="w-full flex items-center justify-between py-6 group text-left">
                                <span className="text-lg font-medium group-hover:text-primary transition-colors">{faq}</span>
                                <ChevronRight className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-24 p-10 md:p-16 rounded-[48px] bg-[#1A6B4A] text-white text-center space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold">Still need help?</h2>
                        <p className="text-white/80 max-w-lg mx-auto">Our support team is available 24/7 to assist you with any questions or concerns.</p>
                    </div>
                    <Button className="bg-[#E8A838] hover:bg-[#E8A838]/90 text-[#1A6B4A] px-10 py-6 h-auto rounded-2xl font-bold text-lg">
                        Contact Us
                    </Button>
                </div>
            </main>
            <Footer />
            <MobileNav />
        </div>
    );
};

export default HelpCenter;
