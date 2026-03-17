import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, Plus, Receipt, Landmark } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PaymentsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PaymentsDialog({ open, onOpenChange }: PaymentsDialogProps) {
    const [activeTab, setActiveTab] = useState<'methods' | 'history'>('methods');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-[32px] p-0 overflow-hidden">
                <div className="bg-[#1A6B4A] p-8 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white">Payments & Payouts</DialogTitle>
                        <DialogDescription className="text-white/80">
                            Manage how you pay and receive money on Pumzika.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={() => setActiveTab('methods')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'methods' ? 'bg-white text-[#1A6B4A]' : 'text-white hover:bg-white/10'}`}
                        >
                            Methods
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-[#1A6B4A]' : 'text-white hover:bg-white/10'}`}
                        >
                            History
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {activeTab === 'methods' ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg text-[#1A6B4A]">Payment Methods</h3>
                                <Button variant="ghost" size="sm" className="text-[#1A6B4A] font-bold gap-2">
                                    <Plus size={16} /> Add
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-[#F7F7F7]">
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-border">
                                        <CreditCard size={20} className="text-[#1A6B4A]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">Visa ending in 4242</p>
                                        <p className="text-xs text-muted-foreground">Expires 12/26</p>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase py-1 px-2 bg-[#1A6B4A]/10 text-[#1A6B4A] rounded-full">Default</span>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-[#F7F7F7]">
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-border">
                                        <Landmark size={20} className="text-[#E8A838]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">M-Pesa Wallet</p>
                                        <p className="text-xs text-muted-foreground">+255 700 ••• 456</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg text-[#1A6B4A]">Transaction History</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center">
                                            <Receipt size={14} className="text-[#1A6B4A]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#1A6B4A]">Safari Lodge Booking</p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Mar 12, 2024</p>
                                        </div>
                                    </div>
                                    <span className="font-mono font-bold text-sm">- TSh 450,000</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <Plus size={14} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#1A6B4A]">Payout: Serengeti Glamping</p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Mar 08, 2024</p>
                                        </div>
                                    </div>
                                    <span className="font-mono font-bold text-sm text-emerald-600">+ TSh 820,000</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <Separator className="bg-border/50" />

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <p>All transacations are secured via SSL.</p>
                        <Button variant="link" className="h-auto p-0 text-[#1A6B4A] font-bold">Learn more</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
