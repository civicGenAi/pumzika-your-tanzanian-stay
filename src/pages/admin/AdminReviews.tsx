import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Star, Trash2, CheckCircle2, ShieldAlert, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminReviews = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select(`
                    *,
                    reviewer:users!reviewer_id(full_name, avatar_url),
                    reviewee:users!reviewee_id(full_name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;

        try {
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Review deleted successfully');
            fetchReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        }
    };

    const filteredReviews = reviews.filter(r =>
        r.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reviewer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reviewee?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight text-[#1A6B4A]">Review Moderation</h1>
                    <p className="text-muted-foreground mt-1">Maintain platform integrity by monitoring community feedback.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                        placeholder="Search feedback..."
                        className="pl-10 bg-card border-border rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="rounded-2xl border-none shadow-sm p-4 text-center">
                    <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                    <p className="text-2xl font-bold text-foreground">{reviews.length}</p>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm p-4 text-center">
                    <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                    <p className="text-2xl font-bold text-[#E8A838]">
                        {(reviews.reduce((acc, r) => acc + r.overall_rating, 0) / (reviews.length || 1)).toFixed(1)} ★
                    </p>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm p-4 text-center">
                    <p className="text-sm font-medium text-muted-foreground">Recent (7d)</p>
                    <p className="text-2xl font-bold text-[#1A6B4A]">
                        {reviews.filter(r => new Date(r.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                    </p>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm p-4 text-center">
                    <p className="text-sm font-medium text-muted-foreground">Flagged</p>
                    <p className="text-2xl font-bold text-destructive">0</p>
                </Card>
            </div>

            <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="pl-6 py-4 font-semibold text-foreground">Reviewer</TableHead>
                                <TableHead className="font-semibold text-foreground">Recipient</TableHead>
                                <TableHead className="font-semibold text-foreground">Rating & Experience</TableHead>
                                <TableHead className="font-semibold text-foreground">Date</TableHead>
                                <TableHead className="text-right pr-6 font-semibold text-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                        Loading reviews...
                                    </TableCell>
                                </TableRow>
                            ) : filteredReviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                        No reviews found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReviews.map((review) => (
                                    <TableRow key={review.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                                    <AvatarImage src={review.reviewer?.avatar_url} />
                                                    <AvatarFallback className="bg-secondary text-primary font-bold">
                                                        {review.reviewer?.full_name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <p className="font-bold text-sm text-foreground">{review.reviewer?.full_name}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-muted-foreground uppercase">Host/Stay</span>
                                                <span className="font-semibold text-sm">{review.reviewee?.full_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-md">
                                                <div className="flex items-center gap-1 mb-1.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={12}
                                                            className={i < Math.floor(review.overall_rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                                                        />
                                                    ))}
                                                    <span className="ml-1 text-sm font-bold text-foreground">{review.overall_rating.toFixed(1)}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed italic border-l-2 border-[#1A6B4A]/20 pl-3">
                                                    "{review.comment}"
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs font-medium">
                                            {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-full text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(review.id)}
                                                    title="Delete Review"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-full text-[#1A6B4A] hover:bg-[#1A6B4A]/10"
                                                    title="Verify Review"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminReviews;
