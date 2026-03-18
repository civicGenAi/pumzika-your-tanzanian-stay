import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { Clock, RefreshCcw, AlertCircle, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const CancellationPolicy = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container max-w-4xl py-12 md:py-20">
                <div className="space-y-12">
                    <div className="space-y-4 text-center">
                        <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 mx-auto">
                            <Clock className="text-primary" size={32} />
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1A6B4A]">Cancellation Policies</h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            We understand that plans can change. Pumzika offers flexible options to ensure peace of mind for both guests and hosts.
                        </p>
                    </div>

                    <div className="bg-[#FDF6EE] border border-[#E8A838]/20 rounded-[40px] p-8 md:p-12 space-y-8">
                        <div className="flex items-start gap-6">
                            <div className="h-12 w-12 rounded-full bg-[#E8A838] flex items-center justify-center shrink-0 shadow-lg">
                                <RefreshCcw className="text-[#1A6B4A]" size={24} />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-[#1A6B4A]">Free cancellation for 48 hours</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    For all bookings, guests receive a full refund if they cancel within 48 hours of booking, provided the cancellation occurs at least 14 days before check-in.
                                </p>
                            </div>
                        </div>

                        <Separator className="bg-[#E8A838]/20" />

                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-4 p-6 bg-white/50 rounded-3xl border border-border/50">
                                <h3 className="text-lg font-bold text-[#1A6B4A]">Standard Policy</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    After the 48-hour grace period, guests can cancel up to 7 days before check-in and get a 50% refund of the nightly rate, plus the cleaning fee.
                                </p>
                            </div>
                            <div className="space-y-4 p-6 bg-white/50 rounded-3xl border border-border/50">
                                <h3 className="text-lg font-bold text-[#1A6B4A]">Last Minute Policy</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Cancellations made within 7 days of check-in are non-refundable. The cleaning fee is always refunded if the guest does not check in.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-[#1A6B4A]">Special Circumstances</h2>
                        <div className="grid gap-6">
                            <div className="flex gap-4 p-6 rounded-3xl border border-border hover:border-primary/20 transition-colors">
                                <AlertCircle className="text-primary shrink-0" size={24} />
                                <div>
                                    <h4 className="font-bold mb-1">Extenuating Circumstances</h4>
                                    <p className="text-sm text-muted-foreground">In rare cases of natural disasters or significant travel restrictions, Pumzika may override the host's policy to provide a refund.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-6 rounded-3xl border border-border hover:border-primary/20 transition-colors">
                                <Info className="text-primary shrink-0" size={24} />
                                <div>
                                    <h4 className="font-bold mb-1">Host Cancellations</h4>
                                    <p className="text-sm text-muted-foreground">If a host cancels your reservation, you will always receive a 100% refund, including all service fees.</p>
                                </div>
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

export default CancellationPolicy;
