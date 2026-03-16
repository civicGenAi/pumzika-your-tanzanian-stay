import { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, User, Clock, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

export const HostReviews = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    reviewer:users!reviewer_id(full_name, avatar_url)
                `)
                .eq('reviewee_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-[#1A6B4A]">Reviews</h2>
                <p className="text-muted-foreground text-sm">Manage guest feedback and build your reputation.</p>
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-48 rounded-2xl" />
                    ))}
                </div>
            ) : reviews.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {reviews.map((review) => (
                        <Card key={review.id} className="rounded-2xl border-none shadow-sm overflow-hidden flex flex-col">
                            <CardContent className="p-6 flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-border shadow-sm">
                                            <AvatarImage src={review.reviewer?.avatar_url} />
                                            <AvatarFallback className="bg-primary/5 text-primary">
                                                <User size={18} />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-[#1A6B4A]">{review.reviewer?.full_name}</p>
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Clock size={10} /> {new Date(review.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                                        <Star size={12} className="fill-amber-400 text-amber-400" />
                                        <span className="text-xs font-bold text-amber-600">{review.overall_rating.toFixed(1)}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed italic">
                                    "{review.comment}"
                                </p>
                            </CardContent>
                            <div className="px-6 py-4 bg-[#FDF6EE]/50 border-t border-border flex items-center justify-between">
                                <button className="text-xs font-semibold text-[#1A6B4A] flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <MessageSquare size={14} /> Reply
                                </button>
                                <span className="text-[10px] font-medium text-muted-foreground italic">Guest review</span>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                    <p className="text-muted-foreground">No reviews yet. Complete your first booking to start getting feedback!</p>
                </div>
            )}
        </div>
    );
};
