import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Users, Calendar, Timer, Trophy, ExternalLink, Plus } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get counts
  const [circuitsResult, driversResult, racesResult, lapsResult] = await Promise.all([
    supabase.from('circuits').select('id', { count: 'exact', head: true }),
    supabase.from('drivers').select('id', { count: 'exact', head: true }),
    supabase.from('races').select('id', { count: 'exact', head: true }),
    supabase.from('laps').select('id', { count: 'exact', head: true }),
  ]);

  const stats = [
    {
      label: 'Circuits',
      count: circuitsResult.count || 0,
      icon: MapPin,
      href: '/admin/circuits',
      color: 'text-cyber-purple',
      bgColor: 'bg-cyber-purple/10',
      borderColor: 'border-cyber-purple/20',
    },
    {
      label: 'Drivers',
      count: driversResult.count || 0,
      icon: Users,
      href: '/admin/drivers',
      color: 'text-aqua-neon',
      bgColor: 'bg-aqua-neon/10',
      borderColor: 'border-aqua-neon/20',
    },
    {
      label: 'Races',
      count: racesResult.count || 0,
      icon: Calendar,
      href: '/admin/races',
      color: 'text-velocity-yellow',
      bgColor: 'bg-velocity-yellow/10',
      borderColor: 'border-velocity-yellow/20',
    },
    {
      label: 'Laps',
      count: lapsResult.count || 0,
      icon: Timer,
      href: '/admin/laps',
      color: 'text-electric-red',
      bgColor: 'bg-electric-red/10',
      borderColor: 'border-electric-red/20',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-f1 text-3xl md:text-4xl font-bold text-soft-white mb-2">Dashboard</h1>
        <p className="text-soft-white/50">Welcome back! Here&apos;s your racing data overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={`glass-card rounded-2xl p-6 border ${stat.borderColor}
                hover:scale-[1.02] transition-all duration-200 group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} 
                  flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className={`font-f1 text-4xl font-bold ${stat.color}`}>
                  {stat.count}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-soft-white group-hover:text-white transition-colors">
                {stat.label}
              </h3>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="font-f1 text-xl font-bold text-soft-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/races/new"
            className="glass-card rounded-2xl p-5 flex items-center gap-4
              hover:border-velocity-yellow/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-velocity-yellow/10 
              flex items-center justify-center group-hover:bg-velocity-yellow/20 transition-colors">
              <Plus size={20} className="text-velocity-yellow" />
            </div>
            <span className="font-medium text-soft-white">New Race</span>
          </Link>
          <Link
            href="/admin/drivers/new"
            className="glass-card rounded-2xl p-5 flex items-center gap-4
              hover:border-aqua-neon/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-aqua-neon/10 
              flex items-center justify-center group-hover:bg-aqua-neon/20 transition-colors">
              <Plus size={20} className="text-aqua-neon" />
            </div>
            <span className="font-medium text-soft-white">New Driver</span>
          </Link>
          <Link
            href="/admin/circuits/new"
            className="glass-card rounded-2xl p-5 flex items-center gap-4
              hover:border-cyber-purple/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyber-purple/10 
              flex items-center justify-center group-hover:bg-cyber-purple/20 transition-colors">
              <Plus size={20} className="text-cyber-purple" />
            </div>
            <span className="font-medium text-soft-white">New Circuit</span>
          </Link>
          <Link
            href="/admin/laps/new"
            className="glass-card rounded-2xl p-5 flex items-center gap-4
              hover:border-electric-red/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-electric-red/10 
              flex items-center justify-center group-hover:bg-electric-red/20 transition-colors">
              <Plus size={20} className="text-electric-red" />
            </div>
            <span className="font-medium text-soft-white">New Lap Time</span>
          </Link>
        </div>
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Link
          href="/scoreboard"
          className="glass-card rounded-2xl p-6 hover:border-velocity-yellow/30 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-velocity-yellow/10 
              flex items-center justify-center">
              <Trophy className="w-6 h-6 text-velocity-yellow" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-soft-white group-hover:text-white transition-colors">
                View Scoreboard
              </h3>
              <p className="text-sm text-soft-white/50">Check overall and yearly rankings</p>
            </div>
            <ExternalLink size={18} className="ml-auto text-soft-white/30" />
          </div>
        </Link>

        <Link
          href="/"
          className="glass-card rounded-2xl p-6 hover:border-electric-red/30 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-electric-red/10 
              flex items-center justify-center">
              <ExternalLink className="w-6 h-6 text-electric-red" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-soft-white group-hover:text-white transition-colors">
                View Public Site
              </h3>
              <p className="text-sm text-soft-white/50">See how visitors view the data</p>
            </div>
            <ExternalLink size={18} className="ml-auto text-soft-white/30" />
          </div>
        </Link>
      </div>
    </div>
  );
}
