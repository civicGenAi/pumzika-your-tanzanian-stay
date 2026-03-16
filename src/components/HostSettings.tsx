import { useState } from 'react';
import { User, Bell, Shield, CreditCard, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

export const HostSettings = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500 text-foreground">
            <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-[#1A6B4A]">Settings</h2>
                <p className="text-muted-foreground text-sm">Manage your host profile, payouts, and notifications.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <CardHeader className="p-6 pb-0">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#1A6B4A]">
                            <User size={20} /> Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                            <Input defaultValue="Tanzania Host" className="rounded-xl border-border/50 bg-[#FDF6EE]/30" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                            <Input defaultValue="+255 700 123 456" className="rounded-xl border-border/50 bg-[#FDF6EE]/30" />
                        </div>
                        <Button className="mt-2 rounded-xl bg-[#1A6B4A] text-white hover:bg-[#1A6B4A]/90">Update Profile</Button>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <CardHeader className="p-6 pb-0">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#1A6B4A]">
                            <CreditCard size={20} /> Payout Methods
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="p-4 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center py-8">
                            <p className="text-sm font-medium text-muted-foreground">No payout methods added</p>
                            <Button variant="outline" className="mt-4 rounded-xl border-none shadow-sm bg-[#1A6B4A]/5 text-[#1A6B4A] hover:bg-[#1A6B4A]/10">
                                Add M-Pesa or Bank account
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <CardHeader className="p-6 pb-0">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#1A6B4A]">
                            <Bell size={20} /> Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-[#1A6B4A]">Email Notifications</p>
                                <p className="text-xs text-muted-foreground">Receive booking updates via email</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-[#1A6B4A]">SMS Alerts</p>
                                <p className="text-xs text-muted-foreground">Instant alerts for new messages</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <CardHeader className="p-6 pb-0">
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#1A6B4A]">
                            <Shield size={20} /> Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <Button variant="outline" className="w-full rounded-xl border-border justify-start font-bold">Change Password</Button>
                        <Button variant="outline" className="w-full rounded-xl border-border justify-start font-bold">Enable Two-Factor Auth</Button>
                        <Button variant="ghost" className="w-full rounded-xl text-destructive hover:bg-destructive/5 justify-start font-bold">
                            <LogOut size={16} className="mr-2" /> Delete Account
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
