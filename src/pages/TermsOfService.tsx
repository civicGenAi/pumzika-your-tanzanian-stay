import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container max-w-3xl py-12 md:py-20">
                <div className="prose prose-slate max-w-none">
                    <h1 className="font-display text-4xl font-bold text-[#1A6B4A] mb-8">Terms of Service</h1>
                    <p className="text-muted-foreground italic mb-12">Last updated: March 18, 2026</p>

                    <section className="space-y-6 mb-12">
                        <h2 className="text-2xl font-bold text-[#1A6B4A]">1. Agreement to Terms</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            By using the Pumzika platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section className="space-y-6 mb-12">
                        <h2 className="text-2xl font-bold text-[#1A6B4A]">2. User Responsibilities</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Users are responsible for maintaining the confidentiality of their account credentials. Guests agree to respect host properties and follow house rules. Hosts agree to provide accurate listing details and maintain safety standards.
                        </p>
                    </section>

                    <section className="space-y-6 mb-12">
                        <h2 className="text-2xl font-bold text-[#1A6B4A]">3. Bookings and Payments</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            All bookings made through Pumzika are subject to the platform's cancellation policies. Payments are processed securely, and Pumzika acts as an intermediary to facilitate transactions.
                        </p>
                    </section>

                    <section className="space-y-6 mb-12">
                        <h2 className="text-2xl font-bold text-[#1A6B4A]">4. Prohibited Activities</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Users may not use the platform for any illegal purpose, post fraudulent listings, or engage in harassment of other community members.
                        </p>
                    </section>

                    <section className="space-y-6 mb-12">
                        <h2 className="text-2xl font-bold text-[#1A6B4A]">5. Limitation of Liability</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Pumzika is a platform that connects guests and hosts. We are not responsible for the condition of properties or the conduct of individual community members.
                        </p>
                    </section>

                    <footer className="pt-12 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            For any questions regarding these terms, please contact us at legal@pumzika.com.
                        </p>
                    </footer>
                </div>
            </main>
            <Footer />
            <MobileNav />
        </div>
    );
};

export default TermsOfService;
