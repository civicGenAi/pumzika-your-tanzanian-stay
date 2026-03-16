import { Search } from 'lucide-react';

interface SearchPillProps {
  variant?: 'hero' | 'navbar';
  where?: string;
  setWhere?: (val: string) => void;
  when?: string;
  setWhen?: (val: string) => void;
  who?: string;
  setWho?: (val: string) => void;
}

export const SearchPill = ({
  variant = 'navbar',
  where,
  setWhere,
  when,
  setWhen,
  who,
  setWho
}: SearchPillProps) => {
  const isHero = variant === 'hero';

  return (
    <div
      className={`flex w-full items-center divide-x divide-border rounded-pill border border-border bg-card transition-shadow hover:shadow-pill-hover ${isHero ? 'max-w-2xl shadow-pill' : 'max-w-xl shadow-card'
        }`}
    >
      <div className="flex flex-1 flex-col items-start px-4 py-2 text-left md:px-6">
        <label htmlFor="where-input" className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Where</label>
        <input
          id="where-input"
          type="text"
          placeholder="Search destinations"
          value={where}
          onChange={(e) => setWhere?.(e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="hidden flex-1 flex-col items-start px-4 py-2 text-left md:flex md:px-6">
        <label htmlFor="when-input" className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">When</label>
        <input
          id="when-input"
          type="text"
          placeholder="Add dates"
          value={when}
          onChange={(e) => setWhen?.(e.target.value)}
          className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="hidden flex-1 items-center justify-between gap-2 py-2 pl-4 pr-2 md:flex md:pl-6">
        <div className="flex flex-col items-start text-left">
          <label htmlFor="who-input" className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Who</label>
          <input
            id="who-input"
            type="text"
            placeholder="Add guests"
            value={who}
            onChange={(e) => setWho?.(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>
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
