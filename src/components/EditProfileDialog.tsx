import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditProfileDialogProps {
    profile: any;
    onUpdate: () => void;
    externalOpen?: boolean;
    setExternalOpen?: (open: boolean) => void;
    triggerOverride?: React.ReactNode;
}

export function EditProfileDialog({
    profile,
    onUpdate,
    externalOpen,
    setExternalOpen,
    triggerOverride
}: EditProfileDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = setExternalOpen !== undefined ? setExternalOpen : setInternalOpen;

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || "",
        phone: profile?.phone || "",
        bio: profile?.bio || "",
        languages: profile?.languages?.join(", ") || "",
    });

    // Update form data when profile changes
    useState(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || "",
                phone: profile.phone || "",
                bio: profile.bio || "",
                languages: profile.languages?.join(", ") || "",
            });
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("users")
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    bio: formData.bio,
                    languages: formData.languages.split(",").map((s) => s.trim()).filter(Boolean),
                })
                .eq("id", profile.id);

            if (error) throw error;
            toast.success("Profile updated successfully");
            onUpdate();
            setOpen(false);
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {triggerOverride !== null && (
                <DialogTrigger asChild>
                    {triggerOverride || <Button variant="link" className="p-0 font-bold underline">Edit profile</Button>}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px] rounded-[32px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-[#1A6B4A]">Edit Profile</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                                id="full_name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="Your full name"
                                required
                                className="rounded-xl"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+255..."
                                className="rounded-xl"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="languages">Languages</Label>
                            <Input
                                id="languages"
                                value={formData.languages}
                                onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                                placeholder="English, Swahili..."
                                className="rounded-xl"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Tell us about yourself..."
                                className="min-h-[100px] rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full bg-[#1A6B4A] hover:bg-[#1A6B4A]/90 rounded-xl py-6 h-auto font-bold">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
