import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Trophy, Calendar, Timer, Flag, MapPin, ChevronRight } from 'lucide-react';
import { formatLapTime, formatDateTime, DEFAULT_DRIVER_IMAGE } from '@/lib/utils';

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
  const wins = raceDrivers?.filter((rd: any) => rd.position === 1).length || 0;

  // Get best lap
  const { data: bestLap } = await supabase
    .from('laps')
    .select('lap_time, races(race_date, circuits(name, id))')
    .eq('driver_id', driver.id)
    .order('lap_time', { ascending: true })
    .limit(1)
    .single();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <Link
          href="/drivers"
          className="inline-flex items-center gap-2 text-soft-white/60 hover:text-soft-white 
            mb-6 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Drivers
        </Link>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Driver Photo & Stats */}
          <div className="space-y-4">
            {/* Photo */}
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="h-72 md:h-96 relative">
                <img
                  src={driver.photo_url || DEFAULT_DRIVER_IMAGE}
                  alt={driver.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal via-transparent to-transparent" />
              </div>
            </div>

            {/* Stats Card */}
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-f1 text-lg font-bold mb-4 text-soft-white">Statistics</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-electric-red/10 border border-electric-red/20 rounded-xl p-3 text-center">
                  <Trophy size={18} className="mx-auto mb-1 text-electric-red" />
                  <p className="font-f1 text-2xl font-bold text-electric-red">{totalPoints}</p>
                  <p className="text-xs text-soft-white/40">Points</p>
                </div>
                <div className="bg-velocity-yellow/10 border border-velocity-yellow/20 rounded-xl p-3 text-center">
                  <Flag size={18} className="mx-auto mb-1 text-velocity-yellow" />
                  <p className="font-f1 text-2xl font-bold text-velocity-yellow">{wins}</p>
                  <p className="text-xs text-soft-white/40">Wins</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <Calendar size={18} className="mx-auto mb-1 text-soft-white/40" />
                  <p className="font-f1 text-2xl font-bold text-soft-white">{raceDrivers?.length || 0}</p>
                  <p className="text-xs text-soft-white/40">Races</p>
                </div>
                {bestLap && (
                  <div className="bg-aqua-neon/10 border border-aqua-neon/20 rounded-xl p-3 text-center">
                    <Timer size={18} className="mx-auto mb-1 text-aqua-neon" />
                    <p className="font-f1 text-lg font-bold text-aqua-neon">
                      {formatLapTime(bestLap.lap_time)}
                    </p>
                    <p className="text-xs text-soft-white/40">Best Lap</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Driver Info & Race History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Name & Info */}
            <div className="glass-card rounded-2xl p-6">
              <h1 className="font-f1 text-4xl md:text-5xl font-bold text-soft-white mb-2">
                {driver.name}
              </h1>
              {driver.birthday && (
                <p className="text-soft-white/50">
                  Born: {new Date(driver.birthday).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              )}
            </div>

            {/* Race History */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-cyber-purple" />
                <h2 className="font-f1 text-lg font-bold text-soft-white">Race History</h2>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {raceDrivers && raceDrivers.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {raceDrivers.map((rd: any, index: number) => (
                    <Link
                      key={rd.race_id}
                      href={`/races/${rd.race_id}`}
                      className="group block glass-card rounded-2xl p-4
                        animate-slide-up opacity-0"
                      style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'forwards' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Position Badge */}
                          <div className={`
                            w-12 h-12 rounded-xl flex items-center justify-center
                            font-f1 font-bold text-lg
                            ${rd.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' : ''}
                            ${rd.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' : ''}
                            ${rd.position === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' : ''}
                            ${!rd.position || rd.position > 3 ? 'bg-white/10 text-soft-white/60' : ''}
                          `}>
                            {rd.position ? `#${rd.position}` : '-'}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-soft-white/40" />
                              <p className="font-semibold text-soft-white group-hover:text-white transition-colors">
                                {rd.races?.circuits?.name || 'Unknown Circuit'}
                              </p>
                            </div>
                            <p className="text-sm text-soft-white/40">
                              {rd.races?.race_date ? formatDateTime(rd.races.race_date) : 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {rd.points !== null && (
                            <div className="text-right">
                              <p className="font-f1 text-xl font-bold text-electric-red">
                                +{rd.points}
                              </p>
                              <p className="text-xs text-soft-white/40">pts</p>
                            </div>
                          )}
                          <ChevronRight size={18} className="text-soft-white/30 
                            group-hover:text-cyber-purple group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-3xl p-12 text-center">
                  <Flag className="w-12 h-12 mx-auto mb-3 text-soft-white/20" />
                  <p className="text-soft-white/50">No race history yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
