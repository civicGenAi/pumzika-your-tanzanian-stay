import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare, Info } from "lucide-react";

interface NotificationsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] rounded-[32px] p-0 overflow-hidden">
                <div className="bg-[#E8A838] p-8 text-[#1A6B4A]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Notifications</DialogTitle>
                        <DialogDescription className="text-[#1A6B4A]/80 font-medium">
                            Decide how you'd like to stay informed about your stays and earnings.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                                    <Mail size={18} className="text-[#1A6B4A]" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-[#1A6B4A]">Email Notifications</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Bookings, receipts, and account updates sent to your email.</p>
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                                    <MessageSquare size={18} className="text-[#1A6B4A]" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-[#1A6B4A]">SMS (WhatsApp) Alerts</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Get instant alerts via WhatsApp/SMS for new messages.</p>
                                </div>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                                    <Bell size={18} className="text-[#1A6B4A]" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-[#1A6B4A]">Browser & App Push</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">Real-time alerts for booking requests and reviews.</p>
                                </div>
                            </div>
                            <Switch />
                        </div>
                    </div>

                    <div className="p-4 bg-secondary/50 rounded-2xl flex gap-3 text-xs text-muted-foreground">
                        <Info size={16} className="shrink-0 text-[#1A6B4A]" />
                        <p>We respect your privacy. You can opt-out of promotional marketing at any time.</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
