import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Edit, Timer } from 'lucide-react';
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
    return (
      <div className="glass-card rounded-2xl p-6 border-electric-red/30 bg-electric-red/5">
        <p className="text-electric-red">Error loading laps: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="font-f1 text-3xl font-bold text-soft-white mb-1">Lap Times</h1>
          <p className="text-soft-white/50">Manage recorded lap times</p>
        </div>
        <Link
          href="/admin/laps/new"
          className="flex items-center gap-2 px-5 py-3 bg-electric-red text-white rounded-xl 
            font-semibold hover:bg-electric-red-light hover:shadow-glow-red transition-all"
        >
          <Plus size={20} />
          Add Lap
        </Link>
      </div>

      {laps && laps.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <Timer className="w-16 h-16 mx-auto mb-4 text-soft-white/20" />
          <p className="text-soft-white/50 text-lg mb-4">No lap times yet</p>
          <Link
            href="/admin/laps/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-electric-red text-white rounded-xl 
              font-semibold hover:bg-electric-red-light transition-all"
          >
            <Plus size={18} />
            Add your first lap time
          </Link>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-xs text-soft-white/40 uppercase tracking-wider font-semibold">Driver</th>
                  <th className="text-left p-4 text-xs text-soft-white/40 uppercase tracking-wider font-semibold">Circuit</th>
                  <th className="text-left p-4 text-xs text-soft-white/40 uppercase tracking-wider font-semibold hidden md:table-cell">Date</th>
                  <th className="text-right p-4 text-xs text-soft-white/40 uppercase tracking-wider font-semibold">Lap Time</th>
                  <th className="text-right p-4 text-xs text-soft-white/40 uppercase tracking-wider font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {laps?.map((lap: any, index: number) => (
                  <tr 
                    key={lap.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-medium text-soft-white">
                        {lap.drivers?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="p-4 text-soft-white/70">
                      {lap.races?.circuits?.name || 'Unknown'}
                    </td>
                    <td className="p-4 text-soft-white/50 hidden md:table-cell">
                      {lap.races?.race_date ? formatDateTime(lap.races.race_date) : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-f1 font-bold text-electric-red">
                        {formatLapTime(lap.lap_time)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/laps/${lap.id}/edit`}
                          className="p-2 bg-white/5 border border-white/10 rounded-lg 
                            hover:bg-white/10 hover:border-white/20 transition-all"
                        >
                          <Edit size={16} className="text-soft-white/70" />
                        </Link>
                        <DeleteLapButton id={lap.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
