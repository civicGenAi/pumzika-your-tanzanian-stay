import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

interface SecurityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SecurityDialog({ open, onOpenChange }: SecurityDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;
            toast.success("Password updated successfully");
            onOpenChange(false);
            setPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            console.error("Error updating password:", error);
            toast.error(error.message || "Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] rounded-3xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2">
                            <ShieldCheck className="text-primary" size={24} />
                        </div>
                        <DialogTitle className="text-center">Update Password</DialogTitle>
                        <DialogDescription className="text-center">
                            Ensure your account stays secure by using a strong password.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full bg-[#1A6B4A] hover:bg-[#1A6B4A]/90 rounded-xl h-12 font-bold">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Change Password
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
