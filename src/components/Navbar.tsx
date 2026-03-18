import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BaobabLogo } from './BaobabLogo';
import { SearchPill } from './SearchPill';
import { Menu, Globe, User, LogOut, LayoutDashboard, Heart, Plane, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuthDrawer } from '@/context/AuthDrawerContext';

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openAuth } = useAuthDrawer();
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHostMode = location.pathname.startsWith('/host-dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else setRole(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    if (data) setRole(data.role);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl transition-all">
      <div className="container flex h-24 items-center justify-between gap-4 md:h-32">
        {/* Logo */}
        <Link to="/" className="shrink-0 scale-90 md:scale-100 transition-transform active:scale-95">
          <BaobabLogo />
        </Link>

        {/* Desktop search */}
        {!isHostMode && (
          <div className="hidden flex-1 justify-center max-w-2xl px-8 md:flex">
            <SearchPill variant="navbar" />
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button className="hidden rounded-full p-2.5 text-foreground transition-colors hover:bg-secondary md:flex">
            <Globe size={20} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 rounded-full border border-border bg-card pr-2 pl-4 py-2 shadow-sm transition-all hover:shadow-md active:scale-95"
          >
            <Menu size={18} strokeWidth={1.5} className="text-foreground" />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 overflow-hidden border border-border shadow-inner">
              {session?.user?.user_metadata?.avatar_url ? (
                <img src={session.user.user_metadata.avatar_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <img src="/pumzika-icon-alt.png" alt="Profile" className="h-full w-full object-cover scale-110" />
              )}
            </div>
          </button>
        </div>
      </div>


      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute right-4 top-full mt-2 w-64 rounded-xl border border-border bg-card py-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in duration-200">
          {session ? (
            <>
              <div className="px-4 py-3 border-b border-border mb-1">
                <p className="text-sm font-semibold truncate">{session.user.user_metadata.full_name || session.user.email}</p>
                <p className="text-xs text-muted-foreground truncate italic capitalize">{role || 'Guest'}</p>
              </div>
              <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary" onClick={() => setMenuOpen(false)}>
                <User size={16} /> My Profile
              </Link>
              <Link to="/saved" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary" onClick={() => setMenuOpen(false)}>
                <Heart size={16} /> Wishlists
              </Link>
              <Link to="/trips" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary" onClick={() => setMenuOpen(false)}>
                <Plane size={16} /> Trips
              </Link>
              <Link to="/inbox" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary" onClick={() => setMenuOpen(false)}>
                <MessageSquare size={16} /> Messages
              </Link>
              <div className="my-1 border-t border-border" />
              {role === 'host' && (
                <Link to="/host-dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary hover:bg-secondary" onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={16} /> Host Dashboard
                </Link>
              )}
              <div className="my-1 border-t border-border" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5"
              >
                <LogOut size={16} /> Log out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  openAuth('login');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary md:hidden"
              >
                Log in
              </button>
              <Link to="/login" className="hidden md:block px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary" onClick={() => setMenuOpen(false)}>Log in</Link>

              <button
                onClick={() => {
                  openAuth('register');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary md:hidden"
              >
                Sign up
              </button>
              <Link to="/register" className="hidden md:block px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary" onClick={() => setMenuOpen(false)}>Sign up</Link>

              <div className="my-1 border-t border-border" />
              <Link to="/become-host" className="block px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary" onClick={() => setMenuOpen(false)}>Become a Host</Link>
              <button className="block w-full text-left px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary" onClick={() => setMenuOpen(false)}>Help Center</button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
