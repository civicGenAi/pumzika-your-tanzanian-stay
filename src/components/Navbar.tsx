import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BaobabLogo } from './BaobabLogo';
import { SearchPill } from './SearchPill';
import { Menu, Globe, User } from 'lucide-react';

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4 md:h-20">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <BaobabLogo />
        </Link>

        {/* Desktop search */}
        <div className="hidden flex-1 justify-center md:flex">
          <SearchPill variant="navbar" />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/become-host"
            className="hidden rounded-pill px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary md:block"
          >
            Become a Host
          </Link>
          <button className="hidden rounded-full p-2 text-foreground transition-colors hover:bg-secondary md:flex">
            <Globe size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-pill border border-border bg-card px-3 py-2 shadow-sm transition-shadow hover:shadow-card"
          >
            <Menu size={16} strokeWidth={1.5} className="text-foreground" />
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
              <User size={14} strokeWidth={1.5} className="text-primary-foreground" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="border-t border-border px-4 py-2 md:hidden">
        <SearchPill variant="navbar" />
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute right-4 top-full mt-2 w-56 rounded-lg border border-border bg-card py-2 shadow-card-hover">
          <Link to="/auth/login" className="block px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary" onClick={() => setMenuOpen(false)}>Log in</Link>
          <Link to="/auth/register" className="block px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary" onClick={() => setMenuOpen(false)}>Sign up</Link>
          <div className="my-1 border-t border-border" />
          <Link to="/become-host" className="block px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary" onClick={() => setMenuOpen(false)}>Become a Host</Link>
          <Link to="/host/dashboard" className="block px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary" onClick={() => setMenuOpen(false)}>Host Dashboard</Link>
        </div>
      )}
    </header>
  );
};
