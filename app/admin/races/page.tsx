import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { Race } from '@/types/database';
import DeleteRaceButton from '@/components/admin/DeleteRaceButton';
import { formatDateTime } from '@/lib/utils';

export default async function RacesPage() {
  const supabase = await createServerSupabase();
  const { data: races, error } = await supabase
    .from('races')
    .select(`
      *,
      circuits (name)
    `)
    .order('race_date', { ascending: false });

  if (error) {
    return <div className="text-red-400">Error loading races: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">Races</h1>
        <Link
          href="/admin/races/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={20} />
          Add Race
        </Link>
      </div>

      {races && races.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No races yet. Add your first race!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {races?.map((race: any) => (
            <div
              key={race.id}
              className="bg-background-secondary border border-gray-800 rounded-lg p-6 hover:border-primary transition-all"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-xl font-bold">{race.circuits?.name || 'Unknown Circuit'}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
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
                  <p className="text-gray-400">{formatDateTime(race.race_date)}</p>
                  {race.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{race.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/races/${race.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 bg-background border border-gray-700 rounded hover:border-primary transition-colors"
                  >
                    <Edit size={16} />
                    Edit
                  </Link>
                  <DeleteRaceButton id={race.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

