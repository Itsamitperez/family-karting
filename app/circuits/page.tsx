import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { CircuitWithStats } from '@/types/database';
import { formatLapTime } from '@/lib/utils';

export default async function CircuitsPage() {
  const supabase = await createServerSupabase();

  // Get circuits with stats
  const { data: circuits } = await supabase
    .from('circuits')
    .select('*')
    .order('name');

  // Get best laps for each circuit
  const circuitsWithStatsUnsorted: CircuitWithStats[] = await Promise.all(
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
      };
    })
  );

  // Sort by most races completed first
  const circuitsWithStats = circuitsWithStatsUnsorted.sort(
    (a, b) => b.races_count - a.races_count
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Circuits
        </h1>
        <p className="text-gray-400 mb-12">Explore all racing circuits</p>

        {circuitsWithStats.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No circuits available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {circuitsWithStats.map((circuit) => (
              <Link
                key={circuit.id}
                href={`/circuits/${circuit.id}`}
                className="bg-background-secondary border border-gray-800 rounded-lg overflow-hidden hover:border-primary transition-all hover:glow-primary"
              >
                {circuit.photo_url && (
                  <div className="h-48 bg-gray-900 relative overflow-hidden">
                    <img
                      src={circuit.photo_url}
                      alt={circuit.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold">{circuit.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        circuit.status === 'active'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {circuit.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 capitalize">{circuit.type}</p>
                  {circuit.length && (
                    <p className="text-sm text-gray-500 mb-2">{circuit.length}m length</p>
                  )}
                  {circuit.best_lap && (
                    <div className="mb-2 p-2 bg-background rounded">
                      <p className="text-xs text-gray-400">Best Lap</p>
                      <p className="text-primary font-mono font-bold">
                        {formatLapTime(circuit.best_lap.lap_time)}
                      </p>
                      <p className="text-xs text-gray-500">by {circuit.best_lap.driver_name}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-400">{circuit.races_count} races completed</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

