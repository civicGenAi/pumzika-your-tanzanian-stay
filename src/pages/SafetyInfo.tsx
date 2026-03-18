import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { Shield, Lock, Eye, AlertTriangle, CheckCircle } from "lucide-react";

const SafetyInfo = () => {
    const safetyTips = [
        {
            title: "For Guests",
            tips: [
                "Always communicate through the Pumzika platform to ensure your safety and protection.",
                "Review the listing details and host profile thoroughly before booking.",
                "Share your itinerary with trusted friends or family.",
                "Inspect the property upon arrival and report any concerns immediately."
            ]
        },
        {
            title: "For Hosts",
            tips: [
                "Verify the identity of your guests through our secure platform.",
                "Maintain clear communication and set expectation through your house rules.",
                "Ensure your property meets all local safety regulations and has working smoke detectors.",
                "Keep emergency contact information readily available for your guests."
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container max-w-4xl py-12 md:py-20">
                <div className="space-y-12">
                    <div className="space-y-4">
                        <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6">
                            <Shield className="text-primary" size={32} />
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1A6B4A]">Your safety is our top priority</h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            At Pumzika, we're committed to creating a safe and trusted community for everyone. Whether you're hosting or traveling, we have tools and resources to help protect you.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {safetyTips.map((section, i) => (
                            <div key={i} className="p-8 rounded-[32px] border border-border bg-card">
                                <h3 className="text-2xl font-bold text-[#1A6B4A] mb-6">{section.title}</h3>
                                <ul className="space-y-4">
                                    {section.tips.map((tip, j) => (
                                        <li key={j} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                                            <CheckCircle className="text-primary shrink-0 mt-1" size={16} />
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-8 py-12 border-t border-border">
                        <h2 className="text-3xl font-bold text-[#1A6B4A]">Pumzika's Safety Standards</h2>
                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="space-y-4">
                                <Lock className="text-[#E8A838]" size={24} />
                                <h4 className="font-bold">Secure Payments</h4>
                                <p className="text-sm text-muted-foreground">Our encrypted payment system ensures your financial information stays safe.</p>
                            </div>
                            <div className="space-y-4">
                                <Eye className="text-[#E8A838]" size={24} />
                                <h4 className="font-bold">Account Protection</h4>
                                <p className="text-sm text-muted-foreground">Multiple layers of security help keep your account and personal details private.</p>
                            </div>
                            <div className="space-y-4">
                                <AlertTriangle className="text-[#E8A838]" size={24} />
                                <h4 className="font-bold">24/7 Support</h4>
                                <p className="text-sm text-muted-foreground">Our specialized safety team is available around the clock to assist you.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <MobileNav />
        </div>
    );
};

export default SafetyInfo;
