import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Zap, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ListingData {
  id: string;
  title: string;
  location: string;
  city: string;
  price: number;
  usdPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  badges: string[];
  isSuperhost?: boolean;
  instantBook?: boolean;
  description?: string;
}

interface ListingCardProps {
  listing: ListingData;
  index?: number;
  onWishlistToggle?: (listingId: string, isSaved: boolean) => void;
}

export const ListingCard = ({ listing, index = 0, onWishlistToggle }: ListingCardProps) => {
  const [saved, setSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    checkWishlistStatus();
  }, [listing.id]);

  const checkWishlistStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('listing_id', listing.id)
      .maybeSingle();

    if (data) setSaved(true);
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please login to save listings');
      return;
    }

    setIsUpdating(true);
    try {
      if (saved) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', session.user.id)
          .eq('listing_id', listing.id);

        if (error) throw error;
        setSaved(false);
        toast.success('Removed from wishlist');
      } else {
        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: session.user.id,
            listing_id: listing.id
          });

        if (error) throw error;
        setSaved(true);
        toast.success('Saved to wishlist');
      }

      if (onWishlistToggle) {
        onWishlistToggle(listing.id, !saved);
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4 }}
      className="group cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${listing.image})` }}
        />

        {/* Save button */}
        <button
          onClick={toggleWishlist}
          disabled={isUpdating}
          className="absolute right-3 top-3 rounded-full bg-card/20 p-2 backdrop-blur-md transition-all hover:bg-card/40 active:scale-90 disabled:opacity-50"
        >
          {isUpdating ? (
            <Loader2 size={18} className="animate-spin text-card" />
          ) : (
            <Heart
              size={18}
              strokeWidth={1.5}
              className={saved ? 'fill-destructive text-destructive' : 'text-card'}
            />
          )}
        </button>

        {/* Superhost Badge */}
        {listing.isSuperhost && (
          <div className="absolute left-3 top-3">
            <span className="rounded-pill bg-card/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground shadow-sm backdrop-blur-sm">
              Superhost
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-body text-[15px] font-semibold text-foreground">
            {listing.title}
          </h3>
          <div className="flex shrink-0 items-center gap-1 text-sm">
            <Star size={14} strokeWidth={1.5} className="fill-accent text-accent" />
            <span className="font-medium text-foreground">{listing.rating}</span>
          </div>
        </div>

        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin size={12} strokeWidth={1.5} />
          {listing.location}
        </p>

        <div className="flex items-center gap-2 pt-0.5">
          <span className="font-mono text-base font-bold text-primary">
            TSh {listing.price.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">/ night</span>
          {listing.usdPrice && (
            <span className="text-[11px] text-muted-foreground">≈ ${listing.usdPrice}</span>
          )}
          {listing.instantBook && (
            <Zap size={14} strokeWidth={1.5} className="ml-auto text-accent" />
          )}
        </div>
      </div>
    </motion.div>
  );
};
