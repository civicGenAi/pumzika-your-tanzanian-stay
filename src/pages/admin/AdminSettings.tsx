import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Percent, ShieldCheck, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const AdminSettings = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState<any>({
        financial: { guest_fee_percent: 14, host_commission_percent: 3, auto_payout: true },
        moderation: { manual_host_approval: true, listing_auto_publish: false },
        presence: { featured_destinations: ["Arusha", "Zanzibar", "Serengeti", "Kilimanjaro", "Dar es Salaam"] }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('platform_settings')
                .select('*');

            if (error) throw error;

            if (data && data.length > 0) {
                const newSettings = { ...settings };
                data.forEach(item => {
                    newSettings[item.key] = item.value;
                });
                setSettings(newSettings);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            for (const key of Object.keys(settings)) {
                const { error } = await supabase
                    .from('platform_settings')
                    .upsert({
                        key,
                        value: settings[key],
                        updated_at: new Date()
                    });
                if (error) throw error;
            }
            toast.success('Platform settings updated successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const updateSetting = (category: string, field: string, value: any) => {
        setSettings({
            ...settings,
            [category]: {
                ...settings[category],
                [field]: value
            }
        });
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading platform configuration...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-display font-bold tracking-tight text-[#1A6B4A]">Platform Settings</h1>
                <p className="text-muted-foreground mt-1">Configure global platform parameters and policies.</p>
            </div>

            <div className="grid gap-6">
                {/* Financial Settings */}
                <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Percent size={20} />
                            </div>
                            <div>
                                <CardTitle>Financial Configuration</CardTitle>
                                <CardDescription>Manage platform fees and payout rules.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="service-fee">Guest Service Fee (%)</Label>
                                <Input
                                    id="service-fee"
                                    type="number"
                                    value={settings.financial.guest_fee_percent}
                                    onChange={(e) => updateSetting('financial', 'guest_fee_percent', Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="host-comm">Host Commission (%)</Label>
                                <Input
                                    id="host-comm"
                                    type="number"
                                    value={settings.financial.host_commission_percent}
                                    onChange={(e) => updateSetting('financial', 'host_commission_percent', Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                            <div className="space-y-0.5">
                                <Label>Automatic Payouts</Label>
                                <p className="text-xs text-muted-foreground">Trigger payouts automatically 24h after check-in.</p>
                            </div>
                            <Switch
                                checked={settings.financial.auto_payout}
                                onCheckedChange={(val) => updateSetting('financial', 'auto_payout', val)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Content & Validation */}
                <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <CardTitle>Moderation & Verification</CardTitle>
                                <CardDescription>Control Listing and Host approval workflows.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                            <div className="space-y-0.5">
                                <Label>Manual Host Approval</Label>
                                <p className="text-xs text-muted-foreground">Admins must verify hosts before they can list.</p>
                            </div>
                            <Switch
                                checked={settings.moderation.manual_host_approval}
                                onCheckedChange={(val) => updateSetting('moderation', 'manual_host_approval', val)}
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                            <div className="space-y-0.5">
                                <Label>Listing Auto-Publish</Label>
                                <p className="text-xs text-muted-foreground">New listings go live immediately without review.</p>
                            </div>
                            <Switch
                                checked={settings.moderation.listing_auto_publish}
                                onCheckedChange={(val) => updateSetting('moderation', 'listing_auto_publish', val)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Regional Settings */}
                <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Globe size={20} />
                            </div>
                            <div>
                                <CardTitle>Global Presence</CardTitle>
                                <CardDescription>Configure supported regions and currencies.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Featured Destinations (comma separated)</Label>
                            <Input
                                value={settings.presence.featured_destinations.join(', ')}
                                onChange={(e) => updateSetting('presence', 'featured_destinations', e.target.value.split(',').map(s => s.trim()))}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" className="rounded-full px-8" onClick={fetchSettings}>Discard Changes</Button>
                <Button onClick={handleSave} disabled={isSaving} className="rounded-full px-8 gap-2">
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>
        </div>
    );
};

export default AdminSettings;
