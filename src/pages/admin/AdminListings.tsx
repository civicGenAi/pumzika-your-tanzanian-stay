import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, MoreVertical, Eye, Trash2, Star, CheckCircle2, AlertCircle, Clock, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const AdminListings = () => {
    const [listings, setListings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('listings')
                .select(`
                    *,
                    host:users!host_id(full_name, email)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setListings(data || []);
        } catch (error) {
            console.error('Error fetching listings:', error);
            toast.error('Failed to load listings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('listings')
                .update({ is_featured: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            toast.success(currentStatus ? 'Removed from Featured' : 'Marked as Featured');
            fetchListings();
        } catch (error) {
            console.error('Error toggling featured:', error);
            toast.error('Failed to update featured status');
        }
    };

    const handleUpdateVerification = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('listings')
                .update({ verification_status: newStatus })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Verification status updated to ${newStatus}`);
            fetchListings();
        } catch (error) {
            console.error('Error updating verification:', error);
            toast.error('Failed to update verification status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;

        try {
            const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Listing deleted successfully');
            fetchListings();
        } catch (error) {
            console.error('Error deleting listing:', error);
            toast.error('Failed to delete listing');
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('listings')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            toast.success(`Listing status updated to ${newStatus}`);
            fetchListings();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const filteredListings = listings.filter(listing =>
        listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.host?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight text-[#1A6B4A]">Listing Moderation</h1>
                    <p className="text-muted-foreground mt-1">Manage and review all properties on the platform.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                        placeholder="Search listings..."
                        className="pl-10 bg-card border-border rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="pl-6 py-4 font-semibold text-foreground">Property</TableHead>
                                <TableHead className="font-semibold text-foreground">Status</TableHead>
                                <TableHead className="font-semibold text-foreground">Verification</TableHead>
                                <TableHead className="font-semibold text-foreground">Host</TableHead>
                                <TableHead className="font-semibold text-foreground">Price/Night</TableHead>
                                <TableHead className="font-semibold text-foreground text-center">Featured</TableHead>
                                <TableHead className="text-right pr-6 font-semibold text-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                        Loading listings...
                                    </TableCell>
                                </TableRow>
                            ) : filteredListings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                        No listings found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredListings.map((listing) => (
                                    <TableRow key={listing.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                                                    {listing.images && listing.images[0] ? (
                                                        <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full bg-slate-200"></div>
                                                    )}
                                                </div>
                                                <div className="truncate max-w-[200px]">
                                                    <p className="font-semibold text-foreground truncate">{listing.title}</p>
                                                    <p className="text-xs text-muted-foreground">{listing.category}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={
                                                listing.status === 'published' ? 'bg-green-100 text-green-800' :
                                                    listing.status === 'draft' ? 'bg-slate-100 text-slate-800' :
                                                        'bg-amber-100 text-amber-800'
                                            }>
                                                {listing.status || 'published'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="outline" className={
                                                    listing.verification_status === 'verified' ? 'border-emerald-500 text-emerald-700 bg-emerald-50' :
                                                        listing.verification_status === 'rejected' ? 'border-destructive text-destructive bg-destructive/5' :
                                                            'border-amber-500 text-amber-700 bg-amber-50'
                                                }>
                                                    {listing.verification_status === 'verified' ? <CheckCircle2 size={10} className="mr-1" /> :
                                                        listing.verification_status === 'rejected' ? <X size={10} className="mr-1" /> :
                                                            <Clock size={10} className="mr-1" />}
                                                    {listing.verification_status || 'pending'}
                                                </Badge>
                                                {listing.agreed_to_standards && (
                                                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                                        <CheckCircle2 size={10} /> Standards Signed
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="truncate max-w-[150px]">
                                                <p className="font-medium text-sm">{listing.host?.full_name}</p>
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <MapPin size={10} />
                                                    <span className="truncate">{listing.location}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-[#1A6B4A]">
                                            ${listing.price}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <button
                                                onClick={() => handleToggleFeatured(listing.id, listing.is_featured)}
                                                className={`p-2 rounded-full transition-colors ${listing.is_featured ? 'text-amber-500 bg-amber-50' : 'text-muted-foreground hover:bg-secondary'}`}
                                            >
                                                <Star size={18} fill={listing.is_featured ? 'currentColor' : 'none'} />
                                            </button>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-full">
                                                        <MoreVertical size={16} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl">
                                                    <DropdownMenuItem onClick={() => window.open(`/listing/${listing.id}`, '_blank')}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Live
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateVerification(listing.id, 'verified')}>
                                                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Verify Listing
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateVerification(listing.id, 'rejected')}>
                                                        <X className="mr-2 h-4 w-4 text-destructive" /> Reject/Unverify
                                                    </DropdownMenuItem>
                                                    <Separator className="my-1" />
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(listing.id, 'published')}>
                                                        <Eye className="mr-2 h-4 w-4 text-blue-600" /> Approve/Publish
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(listing.id, 'rejected')}>
                                                        <AlertCircle className="mr-2 h-4 w-4 text-destructive" /> Set as Rejected
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(listing.id)} className="text-destructive font-bold">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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

export default AdminListings;
