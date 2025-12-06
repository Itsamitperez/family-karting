import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { MapPin, Timer, Flag, ChevronRight, Clock, CloudRain } from 'lucide-react';
import { CircuitWithStats } from '@/types/database';
import { formatLapTime, isCircuitOpen, getTodayOperatingHours } from '@/lib/utils';
import { fetchCurrentWeather } from '@/lib/actions/weather';
import { getWeatherEmoji } from '@/lib/weather';

export default async function CircuitsPage() {
  const supabase = await createServerSupabase();

  // Get circuits with stats
  const { data: circuits } = await supabase
    .from('circuits')
    .select('*')
    .order('name');

  // Get best laps for each circuit and fetch weather
  const circuitsWithStatsUnsorted: (CircuitWithStats & { 
    currentWeather?: { temp: number; description: string; icon: string } | null;
    isOpen: boolean;
    todayHours: string;
  })[] = await Promise.all(
    (circuits || []).map(async (circuit) => {
      // Get best lap for this circuit
      const { data: bestLap } = await supabase
        .from('laps')
        .select('lap_time, drivers(name, id), races!inner(circuit_id)')
        .eq('races.circuit_id', circuit.id)
        .order('lap_time', { ascending: true })
        .limit(1)
        .single();

      // Get race count
      const { count: racesCount } = await supabase
        .from('races')
        .select('id', { count: 'exact', head: true })
        .eq('circuit_id', circuit.id);

      // Fetch current weather only for active circuits with location
      let currentWeather = null;
      if (circuit.status === 'active' && circuit.location_lat && circuit.location_long) {
        const weather = await fetchCurrentWeather(
          Number(circuit.location_lat),
          Number(circuit.location_long)
        );
        if (weather) {
          currentWeather = {
            temp: weather.temp,
            description: weather.description,
            icon: weather.icon,
          };
        }
      }

      const driver = bestLap?.drivers as unknown as { name: string; id: string } | null;
      return {
        ...circuit,
        best_lap: bestLap
          ? {
              lap_time: bestLap.lap_time,
              driver_name: driver?.name || 'Unknown',
              driver_id: driver?.id || '',
            }
          : null,
        races_count: racesCount || 0,
        currentWeather,
        isOpen: isCircuitOpen(
          circuit.operating_hours,
          circuit.location_lat,
          circuit.location_long
        ),
        todayHours: getTodayOperatingHours(
          circuit.operating_hours,
          circuit.location_lat,
          circuit.location_long
        ),
      };
    })
  );

  // Sort: active circuits first (by races count), then inactive circuits
  const circuitsWithStats = circuitsWithStatsUnsorted.sort((a, b) => {
    // First, sort by status (active first)
    if (a.status === 'active' && b.status === 'inactive') return -1;
    if (a.status === 'inactive' && b.status === 'active') return 1;
    
    // Then by race count (descending)
    return b.races_count - a.races_count;
  });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-cyber-purple flex items-center justify-center">
              <MapPin size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-soft-white/40 uppercase tracking-wider">
                Racing Tracks
              </p>
              <h1 className="font-f1 text-3xl md:text-4xl font-bold text-soft-white">
                Circuits
              </h1>
            </div>
          </div>
          <p className="text-soft-white/50 mt-2 max-w-2xl">
            Explore all racing circuits and discover the fastest lap times set by our drivers.
          </p>
        </div>

        {circuitsWithStats.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-soft-white/20" />
            <p className="text-soft-white/50 text-lg">No circuits available yet.</p>
            <p className="text-soft-white/30 text-sm mt-2">Check back soon for new tracks!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {circuitsWithStats.map((circuit, index) => (
              <Link
                key={circuit.id}
                href={`/circuits/${circuit.id}`}
                className="group glass-card rounded-3xl overflow-hidden
                  animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
              >
                {/* Circuit Image */}
                {circuit.photo_url ? (
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={circuit.photo_url}
                      alt={circuit.name}
                      className="w-full h-full object-cover 
                        group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal via-transparent to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`
                        px-3 py-1.5 rounded-full text-xs font-semibold
                        ${circuit.status === 'active'
                          ? 'bg-green-lime/20 text-green-lime border border-green-lime/30'
                          : 'bg-steel-gray text-soft-white/60 border border-white/10'
                        }
                      `}>
                        {circuit.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-steel-gray/50 flex items-center justify-center relative">
                    <MapPin className="w-16 h-16 text-soft-white/10" />
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`
                        px-3 py-1.5 rounded-full text-xs font-semibold
                        ${circuit.status === 'active'
                          ? 'bg-green-lime/20 text-green-lime border border-green-lime/30'
                          : 'bg-steel-gray text-soft-white/60 border border-white/10'
                        }
                      `}>
                        {circuit.status}
                      </span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-f1 text-xl font-bold text-soft-white mb-1 
                    group-hover:text-white transition-colors">
                    {circuit.name}
                  </h3>
                  <p className="text-sm text-soft-white/40 capitalize mb-4">{circuit.type}</p>

                  {/* Operating Hours & Weather */}
                  {(circuit.operating_hours || circuit.currentWeather) && (
                    <div className="mb-4 space-y-2">
                      {circuit.operating_hours && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={14} className={circuit.isOpen ? 'text-green-lime' : 'text-soft-white/40'} />
                          <span className="text-soft-white/60">{circuit.todayHours}</span>
                        </div>
                      )}
                      {circuit.currentWeather && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-lg">{getWeatherEmoji(circuit.currentWeather.description)}</span>
                          <span className="text-soft-white/80 font-medium">
                            {Math.round(circuit.currentWeather.temp)}°C
                          </span>
                          <span className="text-soft-white/50">
                            {circuit.currentWeather.description}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {circuit.length && (
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-soft-white/40 mb-1">Length</p>
                        <p className="font-semibold text-soft-white">{circuit.length}m</p>
                      </div>
                    )}
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-soft-white/40 mb-1">Races</p>
                      <p className="font-semibold text-soft-white">{circuit.races_count}</p>
                    </div>
                  </div>

                  {/* Best Lap */}
                  {circuit.best_lap && (
                    <div className="bg-electric-red/10 border border-electric-red/20 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Timer size={14} className="text-electric-red" />
                        <p className="text-xs text-electric-red font-medium">Track Record</p>
                      </div>
                      <p className="font-f1 text-xl font-bold text-electric-red">
                        {formatLapTime(circuit.best_lap.lap_time)}
                      </p>
                      <p className="text-xs text-soft-white/50 mt-1">
                        by {circuit.best_lap.driver_name}
                      </p>
                    </div>
                  )}

                  {/* Arrow */}
                  <div className="mt-4 flex items-center gap-2 text-soft-white/30 
                    group-hover:text-cyber-purple group-hover:gap-3 transition-all duration-300">
                    <span className="text-sm font-medium">View Details</span>
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
