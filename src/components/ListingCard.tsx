import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Zap, MapPin } from 'lucide-react';

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
  badges: string[];
  isSuperhost?: boolean;
  instantBook?: boolean;
}

interface ListingCardProps {
  listing: ListingData;
  index?: number;
}

export const ListingCard = ({ listing, index = 0 }: ListingCardProps) => {
  const [saved, setSaved] = useState(false);

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
          onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
          className="absolute right-3 top-3 rounded-full bg-card/20 p-2 backdrop-blur-md transition-all hover:bg-card/40 active:scale-90"
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            className={saved ? 'fill-destructive text-destructive' : 'text-card'}
          />
        </button>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {listing.isSuperhost && (
            <span className="rounded-pill bg-card/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground shadow-sm backdrop-blur-sm">
              Superhost
            </span>
          )}
          {listing.badges.map((badge) => (
            <span
              key={badge}
              className="rounded-pill bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground backdrop-blur-sm"
            >
              {badge}
            </span>
          ))}
        </div>
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
