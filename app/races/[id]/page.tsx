import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, Timer, ExternalLink } from 'lucide-react';
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
    .select('*, drivers(name)')
    .eq('race_id', race.id)
    .order('lap_time', { ascending: true });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/races" className="hover:text-white transition-colors">
            Races
          </Link>
          <span>/</span>
          {race.circuits && (
            <>
              <Link 
                href={`/circuits/${race.circuit_id}`} 
                className="hover:text-white transition-colors"
              >
                {race.circuits.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-white">Race Details</span>
        </div>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Link 
                href={`/circuits/${race.circuit_id}`}
                className="text-4xl font-bold mb-2 hover:text-primary transition-colors block"
              >
                {race.circuits?.name || 'Unknown Circuit'}
              </Link>
              <p className="text-gray-400 text-lg">{formatDateTime(race.race_date)}</p>
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

          {race.description && (
            <p className="text-gray-300 mb-4">{race.description}</p>
          )}

          {race.attachment_url && (
            <a
              href={race.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-light"
            >
              View Attachment <ExternalLink size={16} />
            </a>
          )}
        </div>

        {race.status === 'done' && raceDrivers && raceDrivers.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="text-primary" size={24} />
              Race Results
            </h2>
            <div className="space-y-2">
              {raceDrivers.map((rd: any, index: number) => (
                <div
                  key={rd.driver_id}
                  className={`bg-background-secondary border rounded-lg p-4 ${
                    index === 0
                      ? 'border-primary glow-primary'
                      : index === 1
                      ? 'border-accent'
                      : index === 2
                      ? 'border-accent-neon'
                      : 'border-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? 'bg-primary text-white'
                            : index === 1
                            ? 'bg-accent text-black'
                            : index === 2
                            ? 'bg-accent-neon text-black'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {rd.position || index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{rd.drivers?.name || 'Unknown'}</p>
                        {rd.points !== null && (
                          <p className="text-sm text-gray-400">{rd.points} points</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {laps && laps.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Timer className="text-primary" size={24} />
              Lap Times
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-4">Driver</th>
                    <th className="text-left p-4">Lap Time</th>
                  </tr>
                </thead>
                <tbody>
                  {laps.map((lap: any) => (
                    <tr key={lap.id} className="border-b border-gray-800 hover:bg-background-secondary">
                      <td className="p-4">{lap.drivers?.name || 'Unknown'}</td>
                      <td className="p-4 font-mono text-primary font-bold">
                        {formatLapTime(lap.lap_time)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

