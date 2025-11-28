import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, ExternalLink } from 'lucide-react';
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

  // Get best lap
  const { data: bestLap } = await supabase
    .from('laps')
    .select('lap_time, drivers(name, id), races!inner(circuit_id)')
    .eq('races.circuit_id', circuit.id)
    .order('lap_time', { ascending: true })
    .limit(1)
    .single();

  // Get races
  const { data: races } = await supabase
    .from('races')
    .select('*')
    .eq('circuit_id', circuit.id)
    .order('race_date', { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <Link
          href="/circuits"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          Back to Circuits
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {circuit.photo_url && (
            <div className="h-96 bg-gray-900 rounded-lg overflow-hidden">
              <img
                src={circuit.photo_url}
                alt={circuit.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-bold">{circuit.name}</h1>
              <span
                className={`px-3 py-1 text-sm rounded ${
                  circuit.status === 'active'
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {circuit.status}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-400">Type</p>
                <p className="text-lg capitalize">{circuit.type}</p>
              </div>
              {circuit.length && (
                <div>
                  <p className="text-sm text-gray-400">Length</p>
                  <p className="text-lg">{circuit.length}m</p>
                </div>
              )}
              {circuit.location_lat && circuit.location_long && (
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="text-lg">
                    {circuit.location_lat.toFixed(6)}, {circuit.location_long.toFixed(6)}
                  </p>
                </div>
              )}
              {circuit.url && (
                <div>
                  <a
                    href={circuit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary-light"
                  >
                    Visit Circuit Website <ExternalLink size={16} />
                  </a>
                </div>
              )}
            </div>

            {circuit.description && (
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-2">Description</p>
                <p className="text-gray-300">{circuit.description}</p>
              </div>
            )}

            {bestLap && (
              <div className="p-4 bg-background-secondary border border-primary rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Best Lap Time</p>
                <p className="text-3xl font-bold text-primary font-mono mb-1">
                  {formatLapTime(bestLap.lap_time)}
                </p>
                <p className="text-sm text-gray-400">by {(bestLap.drivers as unknown as { name: string } | null)?.name}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Races at this Circuit</h2>
          {races && races.length > 0 ? (
            <div className="space-y-4">
              {races.map((race) => (
                <Link
                  key={race.id}
                  href={`/races/${race.id}`}
                  className="block bg-background-secondary border border-gray-800 rounded-lg p-6 hover:border-primary transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold">{formatDateTime(race.race_date)}</p>
                      <p className="text-sm text-gray-400 capitalize">{race.status}</p>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm rounded ${
                        race.status === 'done'
                          ? 'bg-green-900/30 text-green-400'
                          : race.status === 'scheduled'
                          ? 'bg-blue-900/30 text-blue-400'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {race.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No races at this circuit yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

