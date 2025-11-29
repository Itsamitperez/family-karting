import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, Timer, ExternalLink, MapPin, Calendar, Flag, User, ChevronRight } from 'lucide-react';
import { formatLapTime, formatDateTime } from '@/lib/utils';

export default async function RaceDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();

  const { data: race } = await supabase
    .from('races')
    .select('*, circuits(*)')
    .eq('id', params.id)
    .single();

  if (!race) {
    notFound();
  }

  // Get race results (drivers with positions and points)
  const { data: raceDrivers } = await supabase
    .from('race_drivers')
    .select('*, drivers(*)')
    .eq('race_id', race.id)
    .order('position', { ascending: true });

  // Get all laps for this race
  const { data: laps } = await supabase
    .from('laps')
    .select('*, drivers(name, id)')
    .eq('race_id', race.id)
    .order('lap_time', { ascending: true });

  // Get best lap
  const bestLap = laps?.[0];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-soft-white/40 mb-6">
          <Link href="/races" className="hover:text-soft-white transition-colors">
            Races
          </Link>
          <ChevronRight size={14} />
          {race.circuits && (
            <>
              <Link 
                href={`/circuits/${race.circuit_id}`} 
                className="hover:text-soft-white transition-colors"
              >
                {race.circuits.name}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-soft-white">Race Details</span>
        </div>

        {/* Hero Section */}
        <div className="glass-card rounded-3xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-soft-white/40 mb-2">
                <MapPin size={16} />
                <span className="text-sm">Circuit</span>
              </div>
              <Link 
                href={`/circuits/${race.circuit_id}`}
                className="font-f1 text-3xl md:text-4xl font-bold text-soft-white 
                  hover:text-electric-red transition-colors"
              >
                {race.circuits?.name || 'Unknown Circuit'}
              </Link>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {race.race_type === 'testing' && (
                <span className="px-4 py-2 rounded-full text-sm font-semibold
                  bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30">
                  Testing
                </span>
              )}
              <span className={`
                px-4 py-2 rounded-full text-sm font-semibold
                ${race.status === 'done'
                  ? 'bg-green-lime/20 text-green-lime border border-green-lime/30'
                  : race.status === 'scheduled'
                  ? 'bg-velocity-yellow/20 text-velocity-yellow border border-velocity-yellow/30'
                  : 'bg-steel-gray text-soft-white/60 border border-white/10'
                }
              `}>
                {race.status === 'done' ? 'Completed' : race.status}
              </span>
            </div>
          </div>

          {/* Race Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-soft-white/40" />
                <p className="text-xs text-soft-white/40">Date</p>
              </div>
              <p className="font-semibold text-soft-white">{formatDateTime(race.race_date)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-soft-white/40" />
                <p className="text-xs text-soft-white/40">Drivers</p>
              </div>
              <p className="font-f1 text-xl font-bold text-soft-white">{raceDrivers?.length || 0}</p>
            </div>
            {bestLap && (
              <div className="bg-electric-red/10 border border-electric-red/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Timer size={14} className="text-electric-red" />
                  <p className="text-xs text-electric-red">Fastest Lap</p>
                </div>
                <p className="font-f1 text-xl font-bold text-electric-red">
                  {formatLapTime(bestLap.lap_time)}
                </p>
              </div>
            )}
            {race.circuits?.length && (
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Flag size={14} className="text-soft-white/40" />
                  <p className="text-xs text-soft-white/40">Track Length</p>
                </div>
                <p className="font-semibold text-soft-white">{race.circuits.length}m</p>
              </div>
            )}
          </div>

          {/* Description */}
          {race.description && (
            <p className="text-soft-white/60 mb-4">{race.description}</p>
          )}

          {/* Attachment */}
          {race.attachment_url && (
            <a
              href={race.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30
                hover:bg-cyber-purple/30 transition-all text-sm"
            >
              View Attachment
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Race Results */}
        {race.status === 'done' && raceDrivers && raceDrivers.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Trophy size={18} className="text-velocity-yellow" />
              <h2 className="font-f1 text-xl font-bold text-soft-white">Race Results</h2>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Testing notice */}
            {race.race_type === 'testing' && (
              <div className="glass-card rounded-xl p-4 mb-6 border border-cyber-purple/30 bg-cyber-purple/5">
                <p className="text-cyber-purple text-sm">
                  <span className="font-semibold">Testing Session:</span> Results from this session do not count towards the championship scoreboard.
                </p>
              </div>
            )}

            {/* Podium (Top 3) */}
            {raceDrivers.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 md:gap-6 items-end mb-6">
                {/* 2nd Place */}
                <div className="glass-card rounded-2xl p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full 
                    bg-gradient-to-br from-gray-300 to-gray-500 
                    flex items-center justify-center">
                    <span className="font-f1 text-xl font-bold text-black">2</span>
                  </div>
                  <Link 
                    href={`/drivers/${raceDrivers[1].driver_id}`}
                    className="font-f1 text-lg font-bold text-soft-white hover:text-white transition-colors block truncate"
                  >
                    {raceDrivers[1].drivers?.name || 'Unknown'}
                  </Link>
                  <p className="text-xl font-bold text-gray-400 mt-1">+{raceDrivers[1].points || 0}</p>
                  <p className="text-xs text-soft-white/40">points</p>
                </div>

                {/* 1st Place */}
                <div className="glass-card rounded-2xl p-4 md:p-6 text-center 
                  border-2 border-velocity-yellow/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-velocity-yellow/10 to-transparent" />
                  <div className="relative">
                    <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-2 rounded-full 
                      bg-gradient-to-br from-yellow-400 to-yellow-600 
                      flex items-center justify-center shadow-lg shadow-yellow-500/30">
                      <Trophy size={24} className="text-black" />
                    </div>
                    <Link 
                      href={`/drivers/${raceDrivers[0].driver_id}`}
                      className="font-f1 text-xl font-bold text-velocity-yellow hover:text-white transition-colors block truncate"
                    >
                      {raceDrivers[0].drivers?.name || 'Unknown'}
                    </Link>
                    <p className="text-2xl font-bold text-velocity-yellow mt-1">+{raceDrivers[0].points || 0}</p>
                    <p className="text-xs text-velocity-yellow/60">points</p>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="glass-card rounded-2xl p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full 
                    bg-gradient-to-br from-amber-600 to-amber-800 
                    flex items-center justify-center">
                    <span className="font-f1 text-xl font-bold text-white">3</span>
                  </div>
                  <Link 
                    href={`/drivers/${raceDrivers[2].driver_id}`}
                    className="font-f1 text-lg font-bold text-soft-white hover:text-white transition-colors block truncate"
                  >
                    {raceDrivers[2].drivers?.name || 'Unknown'}
                  </Link>
                  <p className="text-xl font-bold text-amber-600 mt-1">+{raceDrivers[2].points || 0}</p>
                  <p className="text-xs text-soft-white/40">points</p>
                </div>
              </div>
            )}

            {/* Full Results List */}
            <div className="space-y-2">
              {raceDrivers.map((rd: any, index: number) => (
                <Link
                  key={rd.driver_id}
                  href={`/drivers/${rd.driver_id}`}
                  className={`
                    group block glass-card rounded-xl p-4
                    animate-slide-up opacity-0
                    ${index === 0 ? 'border-2 border-velocity-yellow/30' : ''}
                    ${index === 1 ? 'border border-gray-400/30' : ''}
                    ${index === 2 ? 'border border-amber-600/30' : ''}
                  `}
                  style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        font-f1 font-bold
                        ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' : ''}
                        ${index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' : ''}
                        ${index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' : ''}
                        ${index > 2 ? 'bg-white/10 text-soft-white/60' : ''}
                      `}>
                        {rd.position || index + 1}
                      </div>
                      <p className="font-semibold text-soft-white group-hover:text-white transition-colors">
                        {rd.drivers?.name || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {rd.points !== null && (
                        <p className={`
                          font-f1 text-lg font-bold
                          ${index === 0 ? 'text-velocity-yellow' : ''}
                          ${index === 1 ? 'text-gray-400' : ''}
                          ${index === 2 ? 'text-amber-600' : ''}
                          ${index > 2 ? 'text-electric-red' : ''}
                        `}>
                          +{rd.points} pts
                        </p>
                      )}
                      <ChevronRight size={16} className="text-soft-white/30 
                        group-hover:text-aqua-neon group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Lap Times */}
        {laps && laps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Timer size={18} className="text-aqua-neon" />
              <h2 className="font-f1 text-xl font-bold text-soft-white">Lap Times</h2>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-xs text-soft-white/40 uppercase tracking-wider">#</th>
                    <th className="text-left p-4 text-xs text-soft-white/40 uppercase tracking-wider">Driver</th>
                    <th className="text-right p-4 text-xs text-soft-white/40 uppercase tracking-wider">Lap Time</th>
                    <th className="text-right p-4 text-xs text-soft-white/40 uppercase tracking-wider">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {laps.map((lap: any, index: number) => {
                    const gap = index > 0 ? lap.lap_time - laps[0].lap_time : 0;
                    return (
                      <tr 
                        key={lap.id} 
                        className={`
                          border-b border-white/5 hover:bg-white/5 transition-colors
                          ${index === 0 ? 'bg-electric-red/5' : ''}
                        `}
                      >
                        <td className="p-4">
                          <span className={`
                            font-f1 font-bold
                            ${index === 0 ? 'text-electric-red' : 'text-soft-white/50'}
                          `}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="p-4">
                          <Link 
                            href={`/drivers/${lap.drivers?.id || lap.driver_id}`}
                            className="text-soft-white hover:text-electric-red transition-colors"
                          >
                            {lap.drivers?.name || 'Unknown'}
                          </Link>
                        </td>
                        <td className="p-4 text-right">
                          <span className={`
                            font-f1 font-bold
                            ${index === 0 ? 'text-electric-red' : 'text-soft-white'}
                          `}>
                            {formatLapTime(lap.lap_time)}
                          </span>
                        </td>
                        <td className="p-4 text-right text-soft-white/40 font-mono">
                          {index === 0 ? '-' : `+${gap.toFixed(3)}s`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
