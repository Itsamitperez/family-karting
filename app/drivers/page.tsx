import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { User } from 'lucide-react';
import { DriverWithStats } from '@/types/database';

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Drivers
        </h1>
        <p className="text-gray-400 mb-12">Meet the racing family</p>

        {driversWithStats.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No drivers available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {driversWithStats.map((driver) => (
              <Link
                key={driver.id}
                href={`/drivers/${driver.id}`}
                className="bg-background-secondary border border-gray-800 rounded-lg overflow-hidden hover:border-primary transition-all hover:glow-primary"
              >
                {driver.photo_url ? (
                  <div className="h-48 bg-gray-900 relative overflow-hidden">
                    <img
                      src={driver.photo_url}
                      alt={driver.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-900 flex items-center justify-center">
                    <User className="w-24 h-24 text-gray-700" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{driver.name}</h3>
                  {driver.birthday && (
                    <p className="text-sm text-gray-400 mb-4">
                      Born: {new Date(driver.birthday).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400">Races</p>
                      <p className="text-lg font-semibold">{driver.races_count}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Total Points</p>
                      <p className="text-lg font-bold text-primary">{driver.total_points}</p>
                    </div>
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

