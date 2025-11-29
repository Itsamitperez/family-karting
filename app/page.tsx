import Link from 'next/link';
import { Trophy, MapPin, Users, Calendar, ChevronRight, Zap } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase/server';
import StatsSection from '@/components/StatsSection';

const features = [
  {
    href: '/circuits',
    icon: MapPin,
    title: 'Circuits',
    subtitle: 'Racing Tracks',
    description: 'Explore all circuits and track records',
    color: 'from-cyber-purple to-cyber-purple/50',
    iconBg: 'bg-cyber-purple',
    delay: '0ms',
  },
  {
    href: '/drivers',
    icon: Users,
    title: 'Drivers',
    subtitle: 'The Family',
    description: 'Meet the racing legends',
    color: 'from-aqua-neon to-aqua-neon/50',
    iconBg: 'bg-aqua-neon',
    delay: '50ms',
  },
  {
    href: '/races',
    icon: Calendar,
    title: 'Races',
    subtitle: 'Race History',
    description: 'Every lap, every race documented',
    color: 'from-velocity-yellow to-velocity-yellow/50',
    iconBg: 'bg-velocity-yellow',
    delay: '100ms',
  },
  {
    href: '/scoreboard',
    icon: Trophy,
    title: 'Scoreboard',
    subtitle: 'Champions',
    description: 'See who dominates the track',
    color: 'from-electric-red to-electric-red/50',
    iconBg: 'bg-electric-red',
    delay: '150ms',
  },
];

export default async function Home() {
  const supabase = await createServerSupabase();

  // Get real stats
  const [racesResult, lapsResult, circuitsResult] = await Promise.all([
    supabase.from('races').select('id', { count: 'exact', head: true }),
    supabase.from('laps').select('id', { count: 'exact', head: true }),
    supabase.from('circuits').select('id', { count: 'exact', head: true }),
  ]);

  const racesCount = racesResult.count || 0;
  const lapsCount = lapsResult.count || 0;
  const circuitsCount = circuitsResult.count || 0;
  const memoriesCount = lapsCount * 20;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-24">
        <div className="container mx-auto px-4">
          {/* Hero Content */}
          <div className="text-center mb-12 md:mb-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
              bg-electric-red/10 border border-electric-red/20 mb-6
              animate-slide-up">
              <Zap size={14} className="text-electric-red" />
              <span className="text-sm font-medium text-electric-red">Racing Analytics</span>
            </div>

            {/* Main Title */}
            <h1 className="font-f1 text-5xl sm:text-6xl md:text-7xl lg:text-8xl 
              font-bold tracking-tight mb-6
              animate-slide-up stagger-1">
              <span className="text-soft-white">Family</span>
              <br className="sm:hidden" />
              <span className="text-electric-red ml-2 sm:ml-4 text-glow-red">Karting</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-soft-white/60 max-w-2xl mx-auto mb-8
              animate-slide-up stagger-2">
              Track your racing legacy. Compete with family. 
              <span className="text-aqua-neon"> Dominate the track.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4
              animate-slide-up stagger-3">
              <Link
                href="/scoreboard"
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl
                  bg-electric-red text-white font-semibold
                  shadow-lg shadow-electric-red/25
                  hover:shadow-glow-red hover:scale-105
                  transition-all duration-300"
              >
                <Trophy size={20} />
                View Standings
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/races"
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl
                  bg-white/5 text-soft-white font-semibold
                  border border-white/10
                  hover:bg-white/10 hover:border-white/20
                  transition-all duration-300"
              >
                <Calendar size={20} />
                Recent Races
              </Link>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="group glass-card rounded-3xl p-6 
                    animate-slide-up opacity-0"
                  style={{ animationDelay: feature.delay, animationFillMode: 'forwards' }}
                >
                  {/* Icon */}
                  <div className={`
                    w-14 h-14 rounded-2xl ${feature.iconBg}
                    flex items-center justify-center mb-5
                    group-hover:scale-110 group-hover:rotate-3
                    transition-all duration-300
                    shadow-lg
                  `}>
                    <Icon size={26} className="text-white" />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-soft-white/40 uppercase tracking-wider">
                      {feature.subtitle}
                    </p>
                    <h3 className="font-f1 text-2xl font-bold text-soft-white group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-soft-white/50 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="mt-6 flex items-center gap-2 text-soft-white/30 
                    group-hover:text-electric-red group-hover:gap-3 transition-all duration-300">
                    <span className="text-sm font-medium">Explore</span>
                    <ChevronRight size={16} />
                  </div>

                  {/* Gradient line at bottom */}
                  <div className={`
                    absolute bottom-0 left-6 right-6 h-0.5 rounded-full
                    bg-gradient-to-r ${feature.color}
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                  `} />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection 
        racesCount={racesCount}
        lapsCount={lapsCount}
        circuitsCount={circuitsCount}
        memoriesCount={memoriesCount}
      />

    </div>
  );
}
