'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientSupabase } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  MapPin,
  Users,
  Calendar,
  Timer,
  LogOut,
  Menu,
  X,
  Home,
  ChevronRight,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientSupabase();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/circuits', icon: MapPin, label: 'Circuits' },
    { href: '/admin/drivers', icon: Users, label: 'Drivers' },
    { href: '/admin/races', icon: Calendar, label: 'Races' },
    { href: '/admin/laps', icon: Timer, label: 'Laps' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-deep-charcoal">
      {/* Racing Background */}
      <div className="racing-bg" />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-electric-red flex items-center justify-center">
              <span className="font-f1 text-lg font-bold text-white">FK</span>
            </div>
            <div>
              <p className="font-f1 font-bold text-soft-white">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center
              hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <X size={20} className="text-soft-white" /> : <Menu size={20} className="text-soft-white" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-40 transform transition-transform duration-300
          glass border-r border-white/10
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-electric-red flex items-center justify-center shadow-glow-red">
              <span className="font-f1 text-xl font-bold text-white">FK</span>
            </div>
            <div>
              <p className="font-f1 text-lg font-bold text-soft-white">Family Karting</p>
              <p className="text-xs text-soft-white/50">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${active 
                    ? 'bg-electric-red/10 text-electric-red border border-electric-red/20' 
                    : 'text-soft-white/70 hover:text-soft-white hover:bg-white/5'
                  }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {active && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* View Site Link */}
        <div className="p-4 border-t border-white/10 mt-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl
              text-soft-white/70 hover:text-soft-white hover:bg-white/5 transition-all"
          >
            <Home size={20} />
            <span className="font-medium">View Public Site</span>
          </Link>
        </div>

        {/* User & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="mb-4 px-4">
            <p className="text-xs text-soft-white/40">Logged in as</p>
            <p className="text-sm font-medium text-soft-white truncate">{user?.email || 'Admin'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
              text-soft-white/70 hover:text-electric-red hover:bg-electric-red/10 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72 relative z-10">
        <main className="p-4 lg:p-8 pt-20 lg:pt-8 min-h-screen">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-deep-charcoal/80 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
