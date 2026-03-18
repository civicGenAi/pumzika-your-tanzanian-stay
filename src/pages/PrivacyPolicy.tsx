import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container max-w-3xl py-12 md:py-20">
                <div className="prose prose-slate max-w-none">
                    <h1 className="font-display text-4xl font-bold text-[#1A6B4A] mb-8">Privacy Policy</h1>
                    <p className="text-muted-foreground italic mb-12">Last updated: March 18, 2026</p>

                    <section className="space-y-6 mb-12">
                        <h2 className="text-2xl font-bold text-[#1A6B4A]">1. Introduction</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Welcome to Pumzika. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
                        </p>
                    </section>

                    <section className="space-y-6 mb-12">
                        <h2 className="text-2xl font-bold text-[#1A6B4A]">2. Information We Collect</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            We collect information that you provide to us directly, such as when you create an account, list a property, or make a booking. This includes:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                            <li>Personal identifiers (name, email address, phone number).</li>
                            <li>Payment information (processed securely via our third-party provider).</li>
                            <li>Profile data (avatar, bio, and hosting preferences).</li>
                            <li>Communication data (messages sent between guests and hosts).</li>
                        </ul>
                    </section>

                    <section className="space-y-6 mb-12">
                        <h2 className="text-2xl font-bold text-[#1A6B4A]">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                            <li>To facilitate bookings and payments.</li>
                            <li>To enable communication between community members.</li>
                            <li>To improve our services and user experience.</li>
                            <li>To ensure the safety and security of our platform.</li>
                        </ul>
                    </section>

                    <section className="space-y-6 mb-12">
                        <h2 className="text-2xl font-bold text-[#1A6B4A]">4. Data Protection</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            We implement a variety of security measures to maintain the safety of your personal information. Your data is stored on secure servers and access is restricted to authorized personnel only.
                        </p>
                    </section>

                    <footer className="pt-12 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            If you have any questions about this Privacy Policy, please contact us at support@pumzika.com.
                        </p>
                    </footer>
                </div>
            </main>
            <Footer />
            <MobileNav />
        </div>
    );
};

export default PrivacyPolicy;
