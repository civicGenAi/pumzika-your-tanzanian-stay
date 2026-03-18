import { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ReviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    listingId: string;
    hostId: string;
    listingTitle: string;
    onSuccess?: () => void;
}

export const ReviewDialog = ({
    isOpen,
    onClose,
    bookingId,
    listingId,
    hostId,
    listingTitle,
    onSuccess
}: ReviewDialogProps) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('reviews')
                .insert({
                    booking_id: bookingId,
                    listing_id: listingId,
                    reviewer_id: user.id,
                    reviewee_id: hostId,
                    overall_rating: rating,
                    comment: comment
                });

            if (error) {
                if (error.code === '23505') {
                    toast.error('You have already reviewed this stay');
                } else {
                    throw error;
                }
            } else {
                toast.success('Thank you for your review!');
                if (onSuccess) onSuccess();
                onClose();
            }
        } catch (error: any) {
            console.error('Review submission error:', error);
            toast.error(error.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-[32px] p-8">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#1A6B4A]">Rate your stay</DialogTitle>
                    <DialogDescription className="text-base">
                        How was your experience at <span className="font-semibold text-foreground">{listingTitle}</span>?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8 py-6">
                    {/* Star Rating */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setRating(s)}
                                    className="p-1 transition-transform hover:scale-110 active:scale-95"
                                >
                                    <Star
                                        size={40}
                                        className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="text-lg font-bold text-amber-600">
                            {rating === 5 ? 'Amazing!' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Okay' : 'Disappointing'}
                        </span>
                    </div>

                    {/* Comment Field */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            Tell us more (optional)
                        </Label>
                        <Textarea
                            placeholder="Share your thoughts on the location, amenities, or host..."
                            className="min-h-[120px] rounded-2xl border-border bg-secondary/20 p-4 focus:ring-2 focus:ring-primary/20"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        className="h-14 w-full rounded-2xl bg-[#E8A838] p-0 text-lg font-bold text-[#1A6B4A] shadow-md hover:bg-[#E8A838]/90"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={20} />
                                Submitting...
                            </div>
                        ) : (
                            'Submit Review'
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-12 w-full rounded-2xl font-semibold text-muted-foreground"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
