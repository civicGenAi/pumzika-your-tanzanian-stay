import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, FileText, ShieldCheck, MessageCircle, ExternalLink, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface HelpDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
    const helpItems = [
        { icon: MessageCircle, label: "Contact Support", desc: "Speak with our local team in Arusha" },
        { icon: FileText, label: "Terms of Service", desc: "Rules for guests and hosts" },
        { icon: ShieldCheck, label: "Privacy Policy", desc: "How we protect your data" },
        { icon: Globe, label: "Safety Resources", desc: "Stay safe while exploring Tanzania" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] rounded-[32px] p-0 overflow-hidden">
                <div className="bg-[#E8A838] p-8 text-[#1A6B4A]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Help & Legal</DialogTitle>
                        <DialogDescription className="text-[#1A6B4A]/80 font-medium">
                            Everything you need to know about using Pumzika safely.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid gap-3">
                        {helpItems.map((item, i) => (
                            <button
                                key={i}
                                className="flex items-center justify-between p-4 rounded-2xl border border-border hover:bg-secondary transition-colors group text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-secondary rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                                        <item.icon size={20} className="text-[#1A6B4A]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#1A6B4A] text-sm">{item.label}</p>
                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                                <ExternalLink size={16} className="text-muted-foreground group-hover:text-[#1A6B4A]" />
                            </button>
                        ))}
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="text-center space-y-3 pb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Version 1.0.4 - Karibu</p>
                        <p className="text-xs text-muted-foreground">© 2024 Pumzika Stays Ltd. All rights reserved.</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
