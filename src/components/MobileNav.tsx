import { Search, Heart, Map, MessageSquare, User, LayoutDashboard, List, Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthDrawer } from '@/context/AuthDrawerContext';
import { cn } from '@/lib/utils';

const guestItems = [
  { icon: Search, label: 'Explore', path: '/' },
  { icon: Heart, label: 'Saved', path: '/saved' },
  { icon: Map, label: 'Trips', path: '/trips' },
  { icon: MessageSquare, label: 'Inbox', path: '/inbox' },
];

const hostItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/host-dashboard' },
  { icon: List, label: 'Listings', path: '/host-dashboard/listings' },
  { icon: MessageSquare, label: 'Inbox', path: '/inbox' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const MobileNav = () => {
  const location = useLocation();
  const { openAuth } = useAuthDrawer();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isHostMode = location.pathname.startsWith('/host-dashboard');
  const navItems = isHostMode ? hostItems : guestItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] flex h-16 items-center justify-around border-t border-slate-200 bg-white/80 px-2 pb-safe backdrop-blur-xl md:hidden shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
      {navItems.map(({ icon: Icon, label, path }) => {
        const active = location.pathname === path || (path === '/' && location.pathname === '/');
        const isProtected = ['Saved', 'Trips', 'Inbox', 'Profile', 'Dashboard', 'Listings'].includes(label);

        const content = (
          <div className={cn(
            "flex flex-col items-center gap-0.5 transition-all duration-300",
            active ? "text-[#1A6B4A]" : "text-muted-foreground hover:text-foreground"
          )}>
            <div className={cn(
              "p-1.5 rounded-xl transition-all duration-300",
              active ? "bg-[#1A6B4A]/10" : ""
            )}>
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span className={cn(
              "text-[10px] uppercase font-bold tracking-tighter",
              active ? "text-[#1A6B4A]" : "text-slate-400"
            )}>{label}</span>
          </div>
        );

        if (isProtected && !session) {
          return (
            <button
              key={label}
              onClick={() => openAuth('login')}
              className="px-4 py-2"
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            key={label}
            to={path}
            className="px-4 py-2"
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
};
