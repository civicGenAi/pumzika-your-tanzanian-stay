import { Search, Heart, Map, MessageSquare, User, LayoutDashboard, Home, Calendar, List } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const guestItems = [
  { icon: Search, label: 'Explore', path: '/' },
  { icon: Heart, label: 'Saved', path: '/saved' },
  { icon: Map, label: 'Trips', path: '/bookings' },
  { icon: MessageSquare, label: 'Inbox', path: '/inbox' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const hostItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/host-dashboard' },
  { icon: List, label: 'Listings', path: '/host-dashboard/listings' },
  { icon: Calendar, label: 'Calendar', path: '/host-dashboard/calendar' },
  { icon: MessageSquare, label: 'Inbox', path: '/inbox' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const MobileNav = () => {
  const location = useLocation();
  const isHostMode = location.pathname.startsWith('/host-dashboard');
  const navItems = isHostMode ? hostItems : guestItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-card/80 px-2 pb-safe backdrop-blur-xl md:hidden">
      {navItems.map(({ icon: Icon, label, path }) => {
        const active = location.pathname === path || (path === '/' && location.pathname === '/');
        return (
          <Link
            key={label}
            to={path}
            className={`flex flex-col items-center gap-0.5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-medium tracking-wider">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
