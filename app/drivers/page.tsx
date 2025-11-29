import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { User, Trophy, Flag, ChevronRight } from 'lucide-react';
import { DriverWithStats } from '@/types/database';
import { DEFAULT_DRIVER_IMAGE } from '@/lib/utils';

export default async function DriversPage() {
  const supabase = await createServerSupabase();

  const { data: drivers } = await supabase.from('drivers').select('*').order('name');

  const driversWithStats: DriverWithStats[] = await Promise.all(
    (drivers || []).map(async (driver) => {
      // Get race count
      const { count: racesCount } = await supabase
        .from('race_drivers')
        .select('race_id', { count: 'exact', head: true })
        .eq('driver_id', driver.id);

      // Get total points
      const { data: pointsData } = await supabase
        .from('race_drivers')
        .select('points')
        .eq('driver_id', driver.id);

      const totalPoints = pointsData?.reduce((sum, rd) => sum + (rd.points || 0), 0) || 0;

      return {
        ...driver,
        races_count: racesCount || 0,
        total_points: totalPoints,
      };
    })
  );

  // Sort by total points
  const sortedDrivers = driversWithStats.sort((a, b) => b.total_points - a.total_points);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-aqua-neon flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-soft-white/40 uppercase tracking-wider">
                The Family
              </p>
              <h1 className="font-f1 text-3xl md:text-4xl font-bold text-soft-white">
                Drivers
              </h1>
            </div>
          </div>
          <p className="text-soft-white/50 mt-2 max-w-2xl">
            Meet the racing legends. Every driver has a story, every race adds to their legacy.
          </p>
        </div>

        {sortedDrivers.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-soft-white/20" />
            <p className="text-soft-white/50 text-lg">No drivers registered yet.</p>
            <p className="text-soft-white/30 text-sm mt-2">Add drivers through the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {sortedDrivers.map((driver, index) => (
              <Link
                key={driver.id}
                href={`/drivers/${driver.id}`}
                className="group glass-card rounded-3xl overflow-hidden
                  animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
              >
                {/* Driver Photo */}
                <div className="h-56 relative overflow-hidden">
                  <img
                    src={driver.photo_url || DEFAULT_DRIVER_IMAGE}
                    alt={driver.name}
                    className="w-full h-full object-cover 
                      group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal via-deep-charcoal/20 to-transparent" />

                  {/* Position Badge (if has points) */}
                  {index < 3 && driver.total_points > 0 && (
                    <div className="absolute top-4 left-4">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        font-f1 font-bold text-lg
                        ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' : ''}
                        ${index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' : ''}
                        ${index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' : ''}
                      `}>
                        {index + 1}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-f1 text-2xl font-bold text-soft-white mb-2
                    group-hover:text-white transition-colors">
                    {driver.name}
                  </h3>
                  
                  {driver.birthday && (
                    <p className="text-sm text-soft-white/40 mb-4">
                      Born: {new Date(driver.birthday).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Flag size={14} className="text-soft-white/40" />
                        <p className="text-xs text-soft-white/40">Races</p>
                      </div>
                      <p className="font-f1 text-xl font-bold text-soft-white">
                        {driver.races_count}
                      </p>
                    </div>
                    <div className="bg-electric-red/10 border border-electric-red/20 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Trophy size={14} className="text-electric-red" />
                        <p className="text-xs text-electric-red">Points</p>
                      </div>
                      <p className="font-f1 text-xl font-bold text-electric-red">
                        {driver.total_points}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="mt-4 flex items-center gap-2 text-soft-white/30 
                    group-hover:text-aqua-neon group-hover:gap-3 transition-all duration-300">
                    <span className="text-sm font-medium">View Profile</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
