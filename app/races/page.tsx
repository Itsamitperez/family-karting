import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default async function RacesPage() {
  const supabase = await createServerSupabase();

  const { data: races } = await supabase
    .from('races')
    .select(`
      *,
      circuits (name)
    `)
    .order('race_date', { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Races
        </h1>
        <p className="text-gray-400 mb-12">View all race history</p>

        {!races || races.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No races available yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {races.map((race: any) => (
              <Link
                key={race.id}
                href={`/races/${race.id}`}
                className="block bg-background-secondary border border-gray-800 rounded-lg p-6 hover:border-primary transition-all hover:glow-primary"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{race.circuits?.name || 'Unknown Circuit'}</h3>
                    <p className="text-gray-400">{formatDateTime(race.race_date)}</p>
                    {race.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{race.description}</p>
                    )}
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
        )}
      </div>
    </div>
  );
}

