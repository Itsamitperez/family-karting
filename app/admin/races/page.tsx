import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Edit, Calendar } from 'lucide-react';
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
    return (
      <div className="glass-card rounded-2xl p-6 border-electric-red/30 bg-electric-red/5">
        <p className="text-electric-red">Error loading races: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="font-f1 text-3xl font-bold text-soft-white mb-1">Races</h1>
          <p className="text-soft-white/50">Manage your race events</p>
        </div>
        <Link
          href="/admin/races/new"
          className="flex items-center gap-2 px-5 py-3 bg-electric-red text-white rounded-xl 
            font-semibold hover:bg-electric-red-light hover:shadow-glow-red transition-all"
        >
          <Plus size={20} />
          Add Race
        </Link>
      </div>

      {races && races.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-soft-white/20" />
          <p className="text-soft-white/50 text-lg mb-4">No races yet</p>
          <Link
            href="/admin/races/new"
            className="inline-flex items-center gap-2 px-5 py-3 bg-velocity-yellow text-black rounded-xl 
              font-semibold hover:bg-velocity-yellow-light transition-all"
          >
            <Plus size={18} />
            Add your first race
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {races?.map((race: any) => (
            <div
              key={race.id}
              className="glass-card rounded-2xl p-5 hover:border-velocity-yellow/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Date Badge */}
                  <div className="bg-white/5 rounded-xl p-3 text-center min-w-[60px]">
                    <p className="text-xl font-f1 font-bold text-soft-white/70">
                      {new Date(race.race_date).getDate()}
                    </p>
                    <p className="text-xs text-soft-white/40 uppercase">
                      {new Date(race.race_date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-f1 text-xl font-bold text-soft-white">
                        {race.circuits?.name || 'Unknown Circuit'}
                      </h3>
                      <span className={`
                        px-2.5 py-1 text-xs rounded-lg font-semibold
                        ${race.status === 'done'
                          ? 'bg-green-lime/20 text-green-lime'
                          : race.status === 'scheduled'
                          ? 'bg-velocity-yellow/20 text-velocity-yellow'
                          : 'bg-steel-gray text-soft-white/60'
                        }
                      `}>
                        {race.status}
                      </span>
                      {race.race_type === 'testing' && (
                        <span className="px-2.5 py-1 text-xs rounded-lg font-semibold bg-cyber-purple/20 text-cyber-purple">
                          Testing
                        </span>
                      )}
                    </div>
                    <p className="text-soft-white/50">{formatDateTime(race.race_date)}</p>
                    {race.description && (
                      <p className="text-sm text-soft-white/30 mt-2 line-clamp-1">{race.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link
                    href={`/admin/races/${race.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2.5 
                      bg-white/5 border border-white/10 rounded-xl 
                      text-soft-white/70 hover:text-soft-white hover:bg-white/10 hover:border-white/20 
                      transition-all font-medium"
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
