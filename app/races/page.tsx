import { createServerSupabase } from '@/lib/supabase/server';
import Link from 'next/link';
import { Calendar, MapPin, Clock, ChevronRight, CheckCircle2, Timer } from 'lucide-react';
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

  // Group races by status
  const upcomingRaces = races?.filter(r => r.status === 'scheduled') || [];
  const completedRaces = races?.filter(r => r.status === 'done') || [];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-velocity-yellow flex items-center justify-center">
              <Calendar size={24} className="text-black" />
            </div>
            <div>
              <p className="text-xs font-medium text-soft-white/40 uppercase tracking-wider">
                Race History
              </p>
              <h1 className="font-f1 text-3xl md:text-4xl font-bold text-soft-white">
                Races
              </h1>
            </div>
          </div>
          <p className="text-soft-white/50 mt-2 max-w-2xl">
            Every race tells a story. View upcoming events and relive past battles on the track.
          </p>
        </div>

        {(!races || races.length === 0) ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-soft-white/20" />
            <p className="text-soft-white/50 text-lg">No races scheduled yet.</p>
            <p className="text-soft-white/30 text-sm mt-2">Check back soon for upcoming events!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Races */}
            {upcomingRaces.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Timer size={18} className="text-velocity-yellow" />
                  <h2 className="font-f1 text-lg font-bold text-velocity-yellow">Upcoming</h2>
                  <div className="h-px flex-1 bg-velocity-yellow/20" />
                </div>
                <div className="space-y-3">
                  {upcomingRaces.map((race: any, index) => (
                    <Link
                      key={race.id}
                      href={`/races/${race.id}`}
                      className="group block glass-card rounded-2xl p-5 
                        border-l-4 border-velocity-yellow
                        animate-slide-up opacity-0"
                      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {/* Date Badge */}
                          <div className="bg-velocity-yellow/10 rounded-xl p-3 text-center min-w-[60px]">
                            <p className="text-2xl font-f1 font-bold text-velocity-yellow">
                              {new Date(race.race_date).getDate()}
                            </p>
                            <p className="text-xs text-velocity-yellow/70 uppercase">
                              {new Date(race.race_date).toLocaleDateString('en-US', { month: 'short' })}
                            </p>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-f1 text-xl font-bold text-soft-white 
                                group-hover:text-white transition-colors">
                                {race.circuits?.name || 'TBA'}
                              </h3>
                              {race.race_type === 'testing' && (
                                <span className="px-2 py-0.5 text-xs rounded-md font-semibold bg-cyber-purple/20 text-cyber-purple">
                                  Testing
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-soft-white/50">
                              <Clock size={14} />
                              <span className="text-sm">{formatDateTime(race.race_date)}</span>
                            </div>
                            {race.description && (
                              <p className="text-sm text-soft-white/40 mt-2 line-clamp-1">
                                {race.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-4 py-2 rounded-full text-sm font-semibold
                            bg-velocity-yellow/20 text-velocity-yellow border border-velocity-yellow/30">
                            Scheduled
                          </span>
                          <ChevronRight size={20} className="text-soft-white/30 
                            group-hover:text-velocity-yellow group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Completed Races */}
            {completedRaces.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={18} className="text-green-lime" />
                  <h2 className="font-f1 text-lg font-bold text-green-lime">Completed</h2>
                  <div className="h-px flex-1 bg-green-lime/20" />
                </div>
                <div className="space-y-3">
                  {completedRaces.map((race: any, index) => (
                    <Link
                      key={race.id}
                      href={`/races/${race.id}`}
                      className="group block glass-card rounded-2xl p-5
                        animate-slide-up opacity-0"
                      style={{ animationDelay: `${(upcomingRaces.length + index) * 50}ms`, animationFillMode: 'forwards' }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {/* Date Badge */}
                          <div className="bg-white/5 rounded-xl p-3 text-center min-w-[60px]">
                            <p className="text-2xl font-f1 font-bold text-soft-white/70">
                              {new Date(race.race_date).getDate()}
                            </p>
                            <p className="text-xs text-soft-white/40 uppercase">
                              {new Date(race.race_date).toLocaleDateString('en-US', { month: 'short' })}
                            </p>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-f1 text-xl font-bold text-soft-white 
                                group-hover:text-white transition-colors">
                                {race.circuits?.name || 'Unknown Circuit'}
                              </h3>
                              {race.race_type === 'testing' && (
                                <span className="px-2 py-0.5 text-xs rounded-md font-semibold bg-cyber-purple/20 text-cyber-purple">
                                  Testing
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-soft-white/40">
                              <MapPin size={14} />
                              <span className="text-sm">{formatDateTime(race.race_date)}</span>
                            </div>
                            {race.description && (
                              <p className="text-sm text-soft-white/30 mt-2 line-clamp-1">
                                {race.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-4 py-2 rounded-full text-sm font-semibold
                            bg-green-lime/10 text-green-lime border border-green-lime/20">
                            Completed
                          </span>
                          <ChevronRight size={20} className="text-soft-white/30 
                            group-hover:text-green-lime group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
