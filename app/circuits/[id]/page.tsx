import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, ExternalLink, Timer, Flag, Calendar, ChevronRight, Trophy } from 'lucide-react';
import { formatLapTime, formatDateTime } from '@/lib/utils';

export default async function CircuitDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();

  const { data: circuit } = await supabase
    .from('circuits')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!circuit) {
    notFound();
  }

  // Get all lap times for this circuit (track record history)
  const { data: allLaps } = await supabase
    .from('laps')
    .select('lap_time, race_id, drivers(name, id), races!inner(id, circuit_id, race_date, race_type)')
    .eq('races.circuit_id', circuit.id)
    .order('lap_time', { ascending: true });

  // Get best lap (track record)
  const bestLap = allLaps?.[0];
  const driver = bestLap?.drivers as unknown as { name: string; id: string } | null;

  // Get races
  const { data: races } = await supabase
    .from('races')
    .select('*')
    .eq('circuit_id', circuit.id)
    .order('race_date', { ascending: false });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <Link
          href="/circuits"
          className="inline-flex items-center gap-2 text-soft-white/60 hover:text-soft-white 
            mb-6 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Circuits
        </Link>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Circuit Image */}
          <div className="glass-card rounded-3xl overflow-hidden">
            {circuit.photo_url ? (
              <div className="h-72 md:h-96 relative">
                <img
                  src={circuit.photo_url}
                  alt={circuit.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal via-transparent to-transparent" />
              </div>
            ) : (
              <div className="h-72 md:h-96 bg-steel-gray/50 flex items-center justify-center">
                <MapPin className="w-24 h-24 text-soft-white/10" />
              </div>
            )}
          </div>

          {/* Circuit Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="font-f1 text-3xl md:text-4xl font-bold text-soft-white">
                  {circuit.name}
                </h1>
                <span className={`
                  px-3 py-1.5 rounded-full text-xs font-semibold shrink-0
                  ${circuit.status === 'active'
                    ? 'bg-green-lime/20 text-green-lime border border-green-lime/30'
                    : 'bg-steel-gray text-soft-white/60 border border-white/10'
                  }
                `}>
                  {circuit.status}
                </span>
              </div>
              <p className="text-soft-white/50 capitalize">{circuit.type} Circuit</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {circuit.length && (
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-xs text-soft-white/40 mb-1">Track Length</p>
                  <p className="font-f1 text-2xl font-bold text-soft-white">{circuit.length}m</p>
                </div>
              )}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs text-soft-white/40 mb-1">Races Completed</p>
                <p className="font-f1 text-2xl font-bold text-soft-white">{races?.length || 0}</p>
              </div>
            </div>

            {/* Best Lap / Track Record */}
            {bestLap && (
              <div className="glass-card rounded-2xl p-5 border-2 border-electric-red/30 
                bg-gradient-to-br from-electric-red/10 to-transparent">
                <div className="flex items-center gap-2 mb-2">
                  <Timer size={16} className="text-electric-red" />
                  <p className="text-sm font-medium text-electric-red">Track Record</p>
                </div>
                <p className="font-f1 text-4xl font-bold text-electric-red mb-1">
                  {formatLapTime(bestLap.lap_time)}
                </p>
                {driver && (
                  <Link 
                    href={`/drivers/${driver.id}`}
                    className="text-soft-white/60 hover:text-soft-white transition-colors"
                  >
                    by {driver.name}
                  </Link>
                )}
              </div>
            )}

            {/* Description */}
            {circuit.description && (
              <div className="glass-card rounded-2xl p-5">
                <p className="text-xs text-soft-white/40 mb-2">About</p>
                <p className="text-soft-white/80 leading-relaxed">{circuit.description}</p>
              </div>
            )}

            {/* External Link */}
            {circuit.url && (
              <a
                href={circuit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl
                  bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30
                  hover:bg-cyber-purple/30 transition-all"
              >
                Visit Circuit Website
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Track Record History Section */}
        {allLaps && allLaps.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Trophy size={18} className="text-electric-red" />
              <h2 className="font-f1 text-xl font-bold text-soft-white">Track Record History</h2>
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-sm text-soft-white/40">{allLaps.length} lap times</span>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-xs text-soft-white/40 uppercase tracking-wider">#</th>
                    <th className="text-left p-4 text-xs text-soft-white/40 uppercase tracking-wider">Driver</th>
                    <th className="text-right p-4 text-xs text-soft-white/40 uppercase tracking-wider">Lap Time</th>
                    <th className="text-right p-4 text-xs text-soft-white/40 uppercase tracking-wider hidden sm:table-cell">Date</th>
                    <th className="text-center p-4 text-xs text-soft-white/40 uppercase tracking-wider">Type</th>
                    <th className="text-right p-4 text-xs text-soft-white/40 uppercase tracking-wider">Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {allLaps.slice(0, 20).map((lap: any, index: number) => {
                    const lapDriver = lap.drivers as unknown as { name: string; id: string } | null;
                    const gap = index > 0 ? lap.lap_time - allLaps[0].lap_time : 0;
                    const raceDate = lap.races?.race_date;
                    const raceId = lap.race_id || lap.races?.id;
                    const raceType = lap.races?.race_type || 'race';
                    
                    return (
                      <tr 
                        key={`${lap.lap_time}-${index}`}
                        className={`
                          border-b border-white/5 hover:bg-white/5 transition-colors
                          ${index === 0 ? 'bg-electric-red/5' : ''}
                        `}
                      >
                        <td className="p-4">
                          <span className={`
                            font-f1 font-bold
                            ${index === 0 ? 'text-electric-red' : ''}
                            ${index === 1 ? 'text-soft-white/80' : ''}
                            ${index === 2 ? 'text-amber-500' : ''}
                            ${index > 2 ? 'text-soft-white/50' : ''}
                          `}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="p-4">
                          {lapDriver ? (
                            <Link 
                              href={`/drivers/${lapDriver.id}`}
                              className="text-soft-white hover:text-electric-red transition-colors font-medium"
                            >
                              {lapDriver.name}
                            </Link>
                          ) : (
                            <span className="text-soft-white/50">Unknown</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {raceId ? (
                            <Link 
                              href={`/races/${raceId}`}
                              className={`
                                font-f1 font-bold hover:underline transition-colors inline-block
                                ${index === 0 ? 'text-electric-red hover:text-electric-red/80' : 'text-soft-white hover:text-electric-red'}
                              `}
                            >
                              {formatLapTime(lap.lap_time)}
                            </Link>
                          ) : (
                            <span className={`
                              font-f1 font-bold
                              ${index === 0 ? 'text-electric-red' : 'text-soft-white'}
                            `}>
                              {formatLapTime(lap.lap_time)}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right text-soft-white/40 text-sm hidden sm:table-cell">
                          {raceId && raceDate ? (
                            <Link 
                              href={`/races/${raceId}`}
                              className="hover:text-soft-white hover:underline transition-colors"
                            >
                              {new Date(raceDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </Link>
                          ) : raceDate ? (
                            new Date(raceDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {raceType === 'testing' ? (
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold
                              bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30">
                              Testing
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold
                              bg-velocity-yellow/20 text-velocity-yellow border border-velocity-yellow/30">
                              Race
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right text-soft-white/40 font-mono text-sm">
                          {index === 0 ? (
                            <span className="text-electric-red font-semibold">Record</span>
                          ) : (
                            `+${gap.toFixed(3)}s`
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {allLaps.length > 20 && (
                <div className="p-4 text-center border-t border-white/10">
                  <p className="text-sm text-soft-white/40">
                    Showing top 20 of {allLaps.length} lap times
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Races Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Flag size={18} className="text-velocity-yellow" />
            <h2 className="font-f1 text-xl font-bold text-soft-white">Races at this Circuit</h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {races && races.length > 0 ? (
            <div className="space-y-3">
              {races.map((race, index) => (
                <Link
                  key={race.id}
                  href={`/races/${race.id}`}
                  className="group block glass-card rounded-2xl p-5
                    animate-slide-up opacity-0"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/5 rounded-xl p-3 text-center min-w-[60px]">
                        <p className="text-xl font-f1 font-bold text-soft-white/70">
                          {new Date(race.race_date).getDate()}
                        </p>
                        <p className="text-xs text-soft-white/40 uppercase">
                          {new Date(race.race_date).toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-soft-white group-hover:text-white transition-colors">
                          {formatDateTime(race.race_date)}
                        </p>
                        <p className="text-sm text-soft-white/40">
                          {new Date(race.race_date).getFullYear()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`
                        px-3 py-1.5 rounded-full text-xs font-semibold
                        ${race.status === 'done'
                          ? 'bg-green-lime/10 text-green-lime border border-green-lime/20'
                          : race.status === 'scheduled'
                          ? 'bg-velocity-yellow/10 text-velocity-yellow border border-velocity-yellow/20'
                          : 'bg-steel-gray text-soft-white/60 border border-white/10'
                        }
                      `}>
                        {race.status}
                      </span>
                      <ChevronRight size={18} className="text-soft-white/30 
                        group-hover:text-electric-red group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-soft-white/20" />
              <p className="text-soft-white/50">No races at this circuit yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
