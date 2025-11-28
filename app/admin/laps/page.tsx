import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Edit, Trash2, Timer } from 'lucide-react';
import DeleteLapButton from '@/components/admin/DeleteLapButton';
import { formatLapTime, formatDateTime } from '@/lib/utils';

export default async function LapsPage() {
  const supabase = await createServerSupabase();
  const { data: laps, error } = await supabase
    .from('laps')
    .select(`
      *,
      races (id, race_date, circuits (name)),
      drivers (id, name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="text-red-400">Error loading laps: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">Laps</h1>
        <Link
          href="/admin/laps/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus size={20} />
          Add Lap
        </Link>
      </div>

      {laps && laps.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Timer className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No laps yet. Add your first lap time!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4">Driver</th>
                <th className="text-left p-4">Circuit</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Lap Time</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {laps?.map((lap: any) => (
                <tr key={lap.id} className="border-b border-gray-800 hover:bg-background-secondary">
                  <td className="p-4">{lap.drivers?.name || 'Unknown'}</td>
                  <td className="p-4">{lap.races?.circuits?.name || 'Unknown'}</td>
                  <td className="p-4 text-gray-400">{lap.races?.race_date ? formatDateTime(lap.races.race_date) : 'N/A'}</td>
                  <td className="p-4 font-mono text-primary">{formatLapTime(lap.lap_time)}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/laps/${lap.id}/edit`}
                        className="p-2 bg-background border border-gray-700 rounded hover:border-primary transition-colors"
                      >
                        <Edit size={16} />
                      </Link>
                      <DeleteLapButton id={lap.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

