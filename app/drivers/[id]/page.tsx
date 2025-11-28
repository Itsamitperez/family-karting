import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Trophy, Calendar } from 'lucide-react';
import { formatLapTime, formatDateTime } from '@/lib/utils';

export default async function DriverDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();

  const { data: driver } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!driver) {
    notFound();
  }

  // Get race participation
  const { data: raceDrivers } = await supabase
    .from('race_drivers')
    .select('*, races(*, circuits(name))')
    .eq('driver_id', driver.id)
    .order('races(race_date)', { ascending: false });

  // Get total points
  const { data: pointsData } = await supabase
    .from('race_drivers')
    .select('points')
    .eq('driver_id', driver.id);

  const totalPoints = pointsData?.reduce((sum, rd) => sum + (rd.points || 0), 0) || 0;

  // Get best lap
  const { data: bestLap } = await supabase
    .from('laps')
    .select('lap_time, races(race_date, circuits(name))')
    .eq('driver_id', driver.id)
    .order('lap_time', { ascending: true })
    .limit(1)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <Link
          href="/drivers"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          Back to Drivers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1">
            {driver.photo_url ? (
              <div className="h-96 bg-gray-900 rounded-lg overflow-hidden mb-6">
                <img
                  src={driver.photo_url}
                  alt={driver.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-96 bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                <User className="w-32 h-32 text-gray-700" />
              </div>
            )}

            <div className="bg-background-secondary border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Statistics</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Total Points</p>
                  <p className="text-3xl font-bold text-primary">{totalPoints}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Races Completed</p>
                  <p className="text-2xl font-semibold">{raceDrivers?.length || 0}</p>
                </div>
                {bestLap && (
                  <div>
                    <p className="text-sm text-gray-400">Best Lap Time</p>
                    <p className="text-xl font-bold text-primary font-mono">
                      {formatLapTime(bestLap.lap_time)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-4">{driver.name}</h1>
            {driver.birthday && (
              <p className="text-gray-400 mb-8">
                Born: {new Date(driver.birthday).toLocaleDateString()}
              </p>
            )}

            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar size={24} />
                Race History
              </h2>
              {raceDrivers && raceDrivers.length > 0 ? (
                <div className="space-y-4">
                  {raceDrivers.map((rd: any) => (
                    <div
                      key={rd.race_id}
                      className="bg-background-secondary border border-gray-800 rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-lg font-semibold">
                            {rd.races?.circuits?.name || 'Unknown Circuit'}
                          </p>
                          <p className="text-sm text-gray-400">
                            {rd.races?.race_date ? formatDateTime(rd.races.race_date) : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          {rd.position && (
                            <div className="mb-1">
                              <span className="text-sm text-gray-400">Position: </span>
                              <span className="text-lg font-bold text-primary">#{rd.position}</span>
                            </div>
                          )}
                          {rd.points !== null && (
                            <div>
                              <span className="text-sm text-gray-400">Points: </span>
                              <span className="text-lg font-bold text-accent">{rd.points}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No race history yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

