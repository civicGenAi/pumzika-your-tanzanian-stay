import { Search, MapPin, Calendar, Users } from 'lucide-react';

interface SearchPillProps {
  variant?: 'hero' | 'navbar';
}

export const SearchPill = ({ variant = 'navbar' }: SearchPillProps) => {
  const isHero = variant === 'hero';

  return (
    <div
      className={`flex w-full items-center divide-x divide-border rounded-pill border border-border bg-card transition-shadow hover:shadow-pill-hover ${
        isHero ? 'max-w-2xl shadow-pill' : 'max-w-xl shadow-card'
      }`}
    >
      <button className="flex flex-1 items-center gap-2 px-4 py-3 text-left md:px-6">
        <MapPin size={16} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Where</p>
          <p className="truncate text-sm font-medium text-foreground">Search destinations</p>
        </div>
      </button>

      <button className="hidden flex-1 items-center gap-2 px-4 py-3 text-left md:flex md:px-6">
        <Calendar size={16} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">When</p>
          <p className="truncate text-sm font-medium text-foreground">Add dates</p>
        </div>
      </button>

      <div className="hidden flex-1 items-center justify-between gap-2 py-2 pl-4 pr-2 md:flex md:pl-6">
        <button className="flex items-center gap-2 text-left">
          <Users size={16} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Who</p>
            <p className="truncate text-sm font-medium text-foreground">Add guests</p>
          </div>
        </button>
        <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform active:scale-95">
          <Search size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Mobile search button */}
      <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform active:scale-95 md:hidden mr-2">
        <Search size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
};
