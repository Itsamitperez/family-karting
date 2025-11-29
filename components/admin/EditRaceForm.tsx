'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Timer, Save, RefreshCw, Loader2 } from 'lucide-react';
import { Race, Circuit, Driver, Lap } from '@/types/database';
import { formatLapTime, getPointsForPosition, toDateTimeLocal } from '@/lib/utils';
import ImageUpload from '@/components/ui/ImageUpload';

type LapWithDriver = Lap & { drivers: { name: string } | null };
type PendingLap = {
  id: string;
  driver_id: string;
  lap_time: string;
  isNew: boolean;
};

export default function EditRaceForm({ race }: { race: Race }) {
  const router = useRouter();
  const supabase = createClientSupabase();
  const [loading, setLoading] = useState(false);
  const [savingLaps, setSavingLaps] = useState(false);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [existingLaps, setExistingLaps] = useState<LapWithDriver[]>([]);
  const [pendingLaps, setPendingLaps] = useState<PendingLap[]>([]);
  const [formData, setFormData] = useState({
    race_date: toDateTimeLocal(race.race_date),
    status: race.status,
    race_type: race.race_type || 'race' as 'race' | 'testing',
    circuit_id: race.circuit_id,
    description: race.description || '',
    attachment_url: race.attachment_url || '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const [circuitsRes, driversRes, lapsRes] = await Promise.all([
        supabase.from('circuits').select('*').order('name'),
        supabase.from('drivers').select('*').order('name'),
        supabase.from('laps').select('*, drivers(name)').eq('race_id', race.id).order('lap_time'),
      ]);
      if (circuitsRes.data) setCircuits(circuitsRes.data);
      if (driversRes.data) setDrivers(driversRes.data);
      if (lapsRes.data) setExistingLaps(lapsRes.data as LapWithDriver[]);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [race.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('races')
        .update({
          race_date: new Date(formData.race_date).toISOString(),
          status: formData.status,
          race_type: formData.race_type,
          circuit_id: formData.circuit_id,
          description: formData.description || null,
          attachment_url: formData.attachment_url || null,
        })
        .eq('id', race.id);

      if (error) throw error;

      await savePendingLaps();

      // Only calculate results for actual races, not testing sessions
      if (formData.status === 'done' && formData.race_type === 'race') {
        await calculateRaceResults(race.id);
      }

      router.push('/admin/races');
    } catch (err: any) {
      alert('Error updating race: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addLapRow = () => {
    setPendingLaps([...pendingLaps, { id: crypto.randomUUID(), driver_id: '', lap_time: '', isNew: true }]);
  };

  const removeLapRow = (id: string) => {
    setPendingLaps(pendingLaps.filter(lap => lap.id !== id));
  };

  const updateLapRow = (id: string, field: 'driver_id' | 'lap_time', value: string) => {
    setPendingLaps(pendingLaps.map(lap => 
      lap.id === id ? { ...lap, [field]: value } : lap
    ));
  };

  const deleteExistingLap = async (lapId: string) => {
    if (!confirm('Are you sure you want to delete this lap?')) return;
    
    try {
      const { error } = await supabase.from('laps').delete().eq('id', lapId);
      if (error) throw error;
      setExistingLaps(existingLaps.filter(l => l.id !== lapId));
    } catch (err: any) {
      alert('Error deleting lap: ' + err.message);
    }
  };

  const savePendingLaps = async () => {
    const validLaps = pendingLaps.filter(lap => lap.driver_id && lap.lap_time);
    if (validLaps.length === 0) return;

    const lapsToInsert = validLaps.map(lap => ({
      race_id: race.id,
      driver_id: lap.driver_id,
      lap_time: parseFloat(lap.lap_time),
    }));

    const { error } = await supabase.from('laps').insert(lapsToInsert);
    if (error) throw error;

    const { data: newLaps } = await supabase
      .from('laps')
      .select('*, drivers(name)')
      .eq('race_id', race.id)
      .order('lap_time');
    
    if (newLaps) {
      setExistingLaps(newLaps as LapWithDriver[]);
    }
    setPendingLaps([]);
  };

  const saveNewLapsOnly = async () => {
    setSavingLaps(true);
    try {
      await savePendingLaps();
      // Only calculate results for actual races, not testing sessions
      if (formData.status === 'done' && formData.race_type === 'race') {
        await calculateRaceResults(race.id);
      }
    } catch (err: any) {
      alert('Error saving laps: ' + err.message);
    } finally {
      setSavingLaps(false);
    }
  };

  const calculateRaceResults = async (raceId: string) => {
    const { data: laps } = await supabase
      .from('laps')
      .select('driver_id, lap_time')
      .eq('race_id', raceId);

    if (!laps || laps.length === 0) return;

    const driverBestLaps = new Map<string, number>();
    laps.forEach((lap) => {
      const current = driverBestLaps.get(lap.driver_id);
      if (!current || lap.lap_time < current) {
        driverBestLaps.set(lap.driver_id, lap.lap_time);
      }
    });

    const sorted = Array.from(driverBestLaps.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([driver_id], index) => ({
        race_id: raceId,
        driver_id,
        position: index + 1,
        points: getPointsForPosition(index + 1),
      }));

    for (const result of sorted) {
      await supabase.from('race_drivers').upsert(result, {
        onConflict: 'race_id,driver_id',
      });
    }
  };

  const recalculateResults = async () => {
    setSavingLaps(true);
    try {
      await calculateRaceResults(race.id);
      alert('Results recalculated!');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSavingLaps(false);
    }
  };

  const inputClass = `w-full px-4 py-3 bg-[#1a1a2e] border border-white/30 rounded-xl 
    text-soft-white placeholder-soft-white/50
    focus:outline-none focus:border-velocity-yellow focus:ring-2 focus:ring-velocity-yellow/40
    transition-all`;

  return (
    <div>
      <Link
        href="/admin/races"
        className="inline-flex items-center gap-2 text-soft-white/60 hover:text-soft-white mb-6 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Races
      </Link>

      <h1 className="font-f1 text-3xl font-bold text-soft-white mb-8">Edit Race</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Race Details Form */}
        <div>
          <h2 className="font-f1 text-xl font-bold text-soft-white mb-4">Race Details</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-soft-white/70 mb-2">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.race_date}
                  onChange={(e) => setFormData({ ...formData, race_date: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-soft-white/70 mb-2">Circuit *</label>
                <select
                  required
                  value={formData.circuit_id}
                  onChange={(e) => setFormData({ ...formData, circuit_id: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select a circuit</option>
                  {circuits.map((circuit) => (
                    <option key={circuit.id} value={circuit.id}>
                      {circuit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-soft-white/70 mb-2">Status *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'done' | 'scheduled' | 'planned' })}
                    className={inputClass}
                  >
                    <option value="planned">Planned</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-soft-white/70 mb-2">Type *</label>
                  <select
                    required
                    value={formData.race_type}
                    onChange={(e) => setFormData({ ...formData, race_type: e.target.value as 'race' | 'testing' })}
                    className={inputClass}
                  >
                    <option value="race">Race</option>
                    <option value="testing">Testing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-soft-white/70 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <ImageUpload
                label="Attachment (Photo/Receipt)"
                value={formData.attachment_url}
                onChange={(url) => setFormData({ ...formData, attachment_url: url })}
                bucket="images"
                folder="races"
                accentColor="velocity-yellow"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-electric-red text-white rounded-xl font-semibold
                  hover:bg-electric-red-light hover:shadow-glow-red transition-all 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save All'
                )}
              </button>
              <Link
                href="/admin/races"
                className="px-6 py-3 bg-white/5 border border-white/10 text-soft-white rounded-xl 
                  hover:bg-white/10 hover:border-white/20 transition-all font-medium"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Lap Times Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-f1 text-xl font-bold text-soft-white flex items-center gap-2">
              <Timer className="text-electric-red" size={24} />
              Lap Times
            </h2>
            <div className="flex gap-2">
              {formData.status === 'done' && (
                <button
                  onClick={recalculateResults}
                  disabled={savingLaps}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-white/5 border border-white/10 
                    rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-soft-white/70"
                  title="Recalculate race results"
                >
                  <RefreshCw size={14} />
                  Recalc
                </button>
              )}
              <button
                onClick={addLapRow}
                className="flex items-center gap-2 px-4 py-2 bg-electric-red text-white 
                  rounded-xl font-medium hover:bg-electric-red-light transition-colors"
              >
                <Plus size={16} />
                Add Lap
              </button>
            </div>
          </div>

          {/* Existing Laps */}
          {existingLaps.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-soft-white/40 mb-2">Recorded Laps</h3>
              <div className="glass-card rounded-2xl p-4 space-y-2">
                {existingLaps.map((lap) => (
                  <div
                    key={lap.id}
                    className="flex items-center justify-between p-3 bg-deep-charcoal rounded-xl border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-soft-white">{lap.drivers?.name || 'Unknown'}</span>
                      <span className="text-electric-red font-f1 font-bold">
                        {formatLapTime(lap.lap_time)}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteExistingLap(lap.id)}
                      className="p-2 text-electric-red hover:bg-electric-red/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending New Laps */}
          {pendingLaps.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-soft-white/40 mb-2">New Laps (unsaved)</h3>
              <div className="glass-card rounded-2xl p-4 border border-velocity-yellow/30 space-y-2">
                {pendingLaps.map((lap) => (
                  <div
                    key={lap.id}
                    className="flex items-center gap-3 p-3 bg-deep-charcoal rounded-xl border border-white/10"
                  >
                    <select
                      value={lap.driver_id}
                      onChange={(e) => updateLapRow(lap.id, 'driver_id', e.target.value)}
                      className={`flex-1 ${inputClass}`}
                    >
                      <option value="">Select driver</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Time (sec)"
                      value={lap.lap_time}
                      onChange={(e) => updateLapRow(lap.id, 'lap_time', e.target.value)}
                      className={`w-28 ${inputClass}`}
                    />
                    {lap.lap_time && (
                      <span className="w-20 text-electric-red font-f1 font-bold text-sm">
                        {formatLapTime(parseFloat(lap.lap_time) || 0)}
                      </span>
                    )}
                    <button
                      onClick={() => removeLapRow(lap.id)}
                      className="p-2 text-electric-red hover:bg-electric-red/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={saveNewLapsOnly}
                disabled={savingLaps}
                className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-velocity-yellow text-black 
                  rounded-xl font-medium hover:bg-velocity-yellow/90 transition-colors disabled:opacity-50"
              >
                {savingLaps ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save New Laps
                  </>
                )}
              </button>
            </div>
          )}

          {existingLaps.length === 0 && pendingLaps.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-soft-white/40">
                No lap times recorded. Click &quot;Add Lap&quot; to add lap times.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
