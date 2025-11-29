'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Users, Calendar, Trophy, Home } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/circuits', icon: MapPin, label: 'Circuits' },
  { href: '/drivers', icon: Users, label: 'Drivers' },
  { href: '/races', icon: Calendar, label: 'Races' },
  { href: '/scoreboard', icon: Trophy, label: 'Board' },
];

export default function MobileNav() {
  const pathname = usePathname();

  // Don't show on admin pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal via-deep-charcoal/95 to-transparent" />
      
      {/* Nav content */}
      <div className="relative glass border-t border-white/5">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative flex flex-col items-center justify-center
                  min-w-[64px] min-h-[56px] px-3 py-2
                  rounded-2xl transition-all duration-300
                  ${isActive 
                    ? 'text-electric-red' 
                    : 'text-soft-white/60 hover:text-soft-white'
                  }
                `}
              >
                {/* Active indicator background */}
                {isActive && (
                  <div className="absolute inset-1 bg-electric-red/10 rounded-xl" />
                )}
                
                {/* Icon container */}
                <div className={`
                  relative z-10 flex items-center justify-center
                  w-8 h-8 rounded-xl transition-all duration-300
                  ${isActive ? 'scale-110' : 'scale-100'}
                `}>
                  <Icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'drop-shadow-[0_0_8px_rgba(255,30,30,0.6)]' : ''}
                  />
                </div>
                
                {/* Label */}
                <span className={`
                  relative z-10 text-[10px] font-medium mt-1
                  transition-all duration-300
                  ${isActive ? 'opacity-100' : 'opacity-70'}
                `}>
                  {item.label}
                </span>

                {/* Active dot indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-electric-red rounded-full shadow-glow-red" />
                )}
              </Link>
            );
          })}
        </div>
        
        {/* Home indicator bar (iOS style) */}
        <div className="flex justify-center pb-1">
          <div className="w-32 h-1 bg-white/20 rounded-full" />
        </div>
      </div>
    </nav>
  );
}

