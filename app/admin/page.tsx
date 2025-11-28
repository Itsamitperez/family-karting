import { createServerSupabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Users, Calendar, Timer, Trophy } from 'lucide-react';

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
      color: 'text-primary',
    },
    {
      label: 'Drivers',
      count: driversResult.count || 0,
      icon: Users,
      href: '/admin/drivers',
      color: 'text-accent',
    },
    {
      label: 'Races',
      count: racesResult.count || 0,
      icon: Calendar,
      href: '/admin/races',
      color: 'text-accent-neon',
    },
    {
      label: 'Laps',
      count: lapsResult.count || 0,
      icon: Timer,
      href: '/admin/laps',
      color: 'text-primary-light',
    },
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-background-secondary border border-gray-800 rounded-lg p-6 hover:border-primary transition-all duration-300 hover:glow-primary"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <span className="text-3xl font-bold">{stat.count}</span>
              </div>
              <h3 className="text-lg font-semibold">{stat.label}</h3>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link
          href="/scoreboard"
          className="bg-background-secondary border border-gray-800 rounded-lg p-6 hover:border-primary transition-all duration-300"
        >
          <Trophy className="w-8 h-8 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">View Scoreboard</h3>
          <p className="text-gray-400">Check overall and yearly rankings</p>
        </Link>

        <Link
          href="/"
          className="bg-background-secondary border border-gray-800 rounded-lg p-6 hover:border-primary transition-all duration-300"
        >
          <h3 className="text-xl font-semibold mb-2">View Public Site</h3>
          <p className="text-gray-400">See how the public views the data</p>
        </Link>
      </div>
    </div>
  );
}

