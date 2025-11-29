'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Users, Calendar, Trophy, Menu, X, ChevronRight } from 'lucide-react';

const navItems = [
  { href: '/circuits', icon: MapPin, label: 'Circuits' },
  { href: '/drivers', icon: Users, label: 'Drivers' },
  { href: '/races', icon: Calendar, label: 'Races' },
  { href: '/scoreboard', icon: Trophy, label: 'Scoreboard' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${isScrolled 
          ? 'glass border-b border-white/5' 
          : 'bg-transparent'
        }
      `}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group"
            >
              {/* F1 Style Logo Mark */}
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <div className="absolute inset-0 bg-electric-red rounded-lg rotate-3 group-hover:rotate-6 transition-transform" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-f1 text-xl md:text-2xl font-bold text-white">FK</span>
                </div>
              </div>
              
              {/* Logo Text */}
              <div className="hidden sm:block">
                <span className="font-f1 text-xl md:text-2xl font-bold text-soft-white tracking-tight">
                  Family
                </span>
                <span className="font-f1 text-xl md:text-2xl font-bold text-electric-red tracking-tight ml-1">
                  Karting
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname?.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      relative flex items-center gap-2 px-4 py-2.5 rounded-xl
                      font-medium text-sm transition-all duration-200
                      ${isActive 
                        ? 'text-electric-red bg-electric-red/10' 
                        : 'text-soft-white/70 hover:text-soft-white hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-electric-red rounded-full" />
                    )}
                  </Link>
                );
              })}
              
              {/* Admin Button */}
              <Link
                href="/login"
                className="ml-2 px-5 py-2.5 rounded-xl font-semibold text-sm
                  bg-electric-red text-white
                  hover:bg-electric-red-light hover:shadow-glow-red
                  transition-all duration-200"
              >
                Admin
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden relative w-12 h-12 flex items-center justify-center
                rounded-xl transition-colors
                hover:bg-white/5 active:bg-white/10"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-5">
                <span className={`
                  absolute left-0 w-6 h-0.5 bg-soft-white rounded-full
                  transition-all duration-300 origin-center
                  ${isMenuOpen ? 'top-2 rotate-45' : 'top-0'}
                `} />
                <span className={`
                  absolute left-0 top-2 w-6 h-0.5 bg-soft-white rounded-full
                  transition-all duration-300
                  ${isMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'}
                `} />
                <span className={`
                  absolute left-0 w-6 h-0.5 bg-soft-white rounded-full
                  transition-all duration-300 origin-center
                  ${isMenuOpen ? 'top-2 -rotate-45' : 'top-4'}
                `} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`
        fixed inset-0 z-40 md:hidden
        transition-all duration-300
        ${isMenuOpen 
          ? 'opacity-100 pointer-events-auto' 
          : 'opacity-0 pointer-events-none'
        }
      `}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-deep-charcoal/80 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu Panel */}
        <div className={`
          absolute top-16 left-0 right-0 bottom-0
          bg-gradient-to-b from-steel-gray to-deep-charcoal
          border-t border-white/5
          overflow-y-auto
          transition-all duration-300
          ${isMenuOpen ? 'translate-y-0' : '-translate-y-4'}
        `}>
          <div className="p-6 space-y-2">
            {/* Nav Items */}
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center justify-between
                    p-4 rounded-2xl
                    transition-all duration-200
                    animate-slide-up
                    ${isActive 
                      ? 'bg-electric-red/10 border border-electric-red/20' 
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center
                      ${isActive ? 'bg-electric-red' : 'bg-white/10'}
                    `}>
                      <Icon size={22} className={isActive ? 'text-white' : 'text-soft-white/80'} />
                    </div>
                    <div>
                      <p className={`font-semibold ${isActive ? 'text-electric-red' : 'text-soft-white'}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-soft-white/50">
                        {item.href === '/circuits' && 'Explore racing tracks'}
                        {item.href === '/drivers' && 'Meet the family'}
                        {item.href === '/races' && 'View race history'}
                        {item.href === '/scoreboard' && 'See the champions'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-soft-white/30" />
                </Link>
              );
            })}

            {/* Divider */}
            <div className="my-6 border-t border-white/10" />

            {/* Admin Button */}
            <Link
              href="/login"
              className="flex items-center justify-center gap-2
                w-full p-4 rounded-2xl
                bg-electric-red text-white font-semibold
                hover:bg-electric-red-light
                transition-all duration-200
                animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              Admin Access
            </Link>
          </div>

          {/* Bottom safe area */}
          <div className="h-32" />
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20" />
    </>
  );
}
