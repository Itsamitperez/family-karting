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

  // Get all laps with circuit info for personal bests per circuit
  const { data: allLaps } = await supabase
    .from('laps')
    .select('lap_time, races(circuit_id, race_date, circuits(id, name, photo_url))')
    .eq('driver_id', driver.id)
    .order('lap_time', { ascending: true });

  // Calculate personal best for each circuit
  const personalBestsByCircuit = new Map<string, {
    circuit_id: string;
    circuit_name: string;
    circuit_photo: string | null;
    best_time: number;
    race_date: string;
  }>();

  allLaps?.forEach((lap: any) => {
    const circuitId = lap.races?.circuits?.id;
    if (circuitId && !personalBestsByCircuit.has(circuitId)) {
      personalBestsByCircuit.set(circuitId, {
        circuit_id: circuitId,
        circuit_name: lap.races?.circuits?.name || 'Unknown',
        circuit_photo: lap.races?.circuits?.photo_url || null,
        best_time: lap.lap_time,
        race_date: lap.races?.race_date,
      });
    }
  });

  // Get track records for each circuit where the driver has a personal best
  const circuitIds = Array.from(personalBestsByCircuit.keys());
  const { data: trackRecords } = await supabase
    .from('laps')
    .select('races(circuit_id), lap_time')
    .in('races.circuit_id', circuitIds)
    .order('lap_time', { ascending: true });

  // Create a map of circuit_id to fastest lap time
  const trackRecordsByCircuit = new Map<string, number>();
  trackRecords?.forEach((lap: any) => {
    const circuitId = lap.races?.circuit_id;
    if (circuitId && !trackRecordsByCircuit.has(circuitId)) {
      trackRecordsByCircuit.set(circuitId, lap.lap_time);
    }
  });

  const personalBests = Array.from(personalBestsByCircuit.values())
    .map(pb => ({
      ...pb,
      track_record: trackRecordsByCircuit.get(pb.circuit_id) || null,
      gap_to_record: trackRecordsByCircuit.get(pb.circuit_id) 
        ? pb.best_time - trackRecordsByCircuit.get(pb.circuit_id)!
        : null
    }))
    .sort((a, b) => a.circuit_name.localeCompare(b.circuit_name));

  // Count track records held by this driver
  const trackRecordsCount = personalBests.filter(pb => pb.gap_to_record === 0).length;

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
          {/* Driver Photo & Stats - uses flex with order for mobile reordering */}
          <div className="flex flex-col gap-4">
            {/* Photo */}
            <div className="glass-card rounded-3xl overflow-hidden order-1">
              <div className="h-72 md:h-96 relative">
                <img
                  src={driver.photo_url || DEFAULT_DRIVER_IMAGE}
                  alt={driver.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal via-transparent to-transparent" />
              </div>
            </div>

            {/* Name & Info - Shows after photo on mobile, hidden on lg (shown in right column) */}
            <div className="glass-card rounded-2xl p-6 order-2 lg:hidden">
              <h1 className="font-f1 text-4xl font-bold text-soft-white mb-2">
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

            {/* Stats Card */}
            <div className="glass-card rounded-2xl p-5 order-3">
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
                <div className="bg-aqua-neon/10 border border-aqua-neon/20 rounded-xl p-3 text-center">
                  <Timer size={18} className="mx-auto mb-1 text-aqua-neon" />
                  <p className="font-f1 text-2xl font-bold text-aqua-neon">
                    {trackRecordsCount}
                  </p>
                  <p className="text-xs text-soft-white/40">Track Records</p>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Info & Race History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Name & Info - Hidden on mobile (shown in left column), visible on lg */}
            <div className="glass-card rounded-2xl p-6 hidden lg:block">
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

            {/* Personal Best in Every Circuit */}
            {personalBests.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Timer size={18} className="text-aqua-neon" />
                  <h2 className="font-f1 text-lg font-bold text-soft-white">Personal Best in Every Circuit</h2>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {personalBests.map((pb, index) => {
                    const isTrackRecord = pb.gap_to_record === 0;
                    const hasGap = pb.gap_to_record !== null && pb.gap_to_record > 0;
                    
                    return (
                      <Link
                        key={pb.circuit_id}
                        href={`/circuits/${pb.circuit_id}`}
                        className={`group glass-card rounded-xl overflow-hidden
                          animate-slide-up opacity-0 transition-all duration-300
                          ${isTrackRecord ? 'ring-1 ring-velocity-yellow/50' : 'hover:ring-1 hover:ring-white/20'}`}
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                      >
                        {/* Circuit Header with Photo */}
                        <div className="relative h-12">
                          {pb.circuit_photo ? (
                            <img
                              src={pb.circuit_photo}
                              alt={pb.circuit_name}
                              className="w-full h-full object-cover opacity-40 group-hover:opacity-60 
                                group-hover:scale-105 transition-all duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-cyber-purple/20 to-aqua-neon/10" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal via-deep-charcoal/80 to-transparent" />
                          
                          <div className="absolute inset-0 px-3 flex items-center">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <MapPin size={12} className="text-soft-white/60 shrink-0" />
                              <p className="text-sm font-semibold text-soft-white group-hover:text-white transition-colors truncate">
                                {pb.circuit_name}
                              </p>
                              {isTrackRecord && (
                                <span className="bg-velocity-yellow text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                                  RECORD
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stats Section */}
                        <div className="p-3">
                          {/* Time Comparison */}
                          <div className="flex items-stretch gap-2">
                            {/* Your Best */}
                            <div className={`flex-1 rounded-lg p-2 ${isTrackRecord 
                              ? 'bg-gradient-to-br from-velocity-yellow/20 to-velocity-yellow/5 border border-velocity-yellow/30' 
                              : 'bg-aqua-neon/10 border border-aqua-neon/20'}`}>
                              <p className={`text-[10px] font-medium ${isTrackRecord ? 'text-velocity-yellow/70' : 'text-aqua-neon/70'}`}>
                                Your Best
                              </p>
                              <p className={`font-f1 text-base font-bold ${isTrackRecord ? 'text-velocity-yellow' : 'text-aqua-neon'}`}>
                                {formatLapTime(pb.best_time)}
                              </p>
                            </div>

                            {/* Track Record (only show if not the record holder) */}
                            {hasGap && pb.track_record && (
                              <div className="flex-1 rounded-lg p-2 bg-white/5 border border-white/10">
                                <p className="text-[10px] font-medium text-soft-white/50">
                                  Record
                                </p>
                                <p className="font-f1 text-base font-bold text-soft-white/80">
                                  {formatLapTime(pb.track_record)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Gap Indicator */}
                          {hasGap && (
                            <div className="mt-2 flex items-center justify-between bg-electric-red/10 border border-electric-red/20 rounded-lg px-2.5 py-1.5">
                              <span className="text-xs text-soft-white/60">Gap to beat</span>
                              <span className="font-f1 text-sm font-bold text-electric-red">
                                +{formatLapTime(pb.gap_to_record!)}
                              </span>
                            </div>
                          )}

                          {/* Date */}
                          <p className="text-[10px] text-soft-white/40 mt-2">
                            {new Date(pb.race_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

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
