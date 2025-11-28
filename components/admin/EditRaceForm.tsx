'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Timer, Save, RefreshCw } from 'lucide-react';
import { Race, Circuit, Driver, Lap } from '@/types/database';
import { formatLapTime, getPointsForPosition, toDateTimeLocal } from '@/lib/utils';

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
          circuit_id: formData.circuit_id,
          description: formData.description || null,
          attachment_url: formData.attachment_url || null,
        })
        .eq('id', race.id);

      if (error) throw error;

      // Save pending laps if any
      await savePendingLaps();

      // Recalculate results if status is done
      if (formData.status === 'done') {
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

    // Refresh existing laps
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
      if (formData.status === 'done') {
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

    // Get best lap per driver
    const driverBestLaps = new Map<string, number>();
    laps.forEach((lap) => {
      const current = driverBestLaps.get(lap.driver_id);
      if (!current || lap.lap_time < current) {
        driverBestLaps.set(lap.driver_id, lap.lap_time);
      }
    });

    // Sort by best lap
    const sorted = Array.from(driverBestLaps.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([driver_id], index) => ({
        race_id: raceId,
        driver_id,
        position: index + 1,
        points: getPointsForPosition(index + 1),
      }));

    // Upsert race results
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

  return (
    <div>
      <Link
        href="/admin/races"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft size={20} />
        Back to Races
      </Link>

      <h1 className="text-4xl font-bold mb-8">Edit Race</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Race Details Form */}
        <div>
          <h2 className="text-xl font-bold mb-4">Race Details</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.race_date}
                onChange={(e) => setFormData({ ...formData, race_date: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Circuit *</label>
              <select
                required
                value={formData.circuit_id}
                onChange={(e) => setFormData({ ...formData, circuit_id: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">Select a circuit</option>
                {circuits.map((circuit) => (
                  <option key={circuit.id} value={circuit.id}>
                    {circuit.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'done' | 'scheduled' | 'planned' })}
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="planned">Planned</option>
                <option value="scheduled">Scheduled</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Attachment URL</label>
              <input
                type="url"
                value={formData.attachment_url}
                onChange={(e) => setFormData({ ...formData, attachment_url: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save All'}
              </button>
              <Link
                href="/admin/races"
                className="px-6 py-2 bg-background-secondary border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Lap Times Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Timer className="text-primary" size={24} />
              Lap Times
            </h2>
            <div className="flex gap-2">
              {formData.status === 'done' && (
                <button
                  onClick={recalculateResults}
                  disabled={savingLaps}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-background-secondary border border-gray-700 rounded-lg hover:border-primary transition-colors"
                  title="Recalculate race results"
                >
                  <RefreshCw size={14} />
                  Recalc
                </button>
              )}
              <button
                onClick={addLapRow}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <Plus size={16} />
                Add Lap
              </button>
            </div>
          </div>

          {/* Existing Laps */}
          {existingLaps.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Recorded Laps</h3>
              <div className="space-y-2">
                {existingLaps.map((lap) => (
                  <div
                    key={lap.id}
                    className="flex items-center justify-between p-3 bg-background-secondary rounded-lg border border-gray-800"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{lap.drivers?.name || 'Unknown'}</span>
                      <span className="text-primary font-mono font-bold">
                        {formatLapTime(lap.lap_time)}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteExistingLap(lap.id)}
                      className="p-1.5 text-red-400 hover:bg-red-900/20 rounded transition-colors"
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
              <h3 className="text-sm font-medium text-gray-400 mb-2">New Laps (unsaved)</h3>
              <div className="space-y-2">
                {pendingLaps.map((lap) => (
                  <div
                    key={lap.id}
                    className="flex items-center gap-3 p-3 bg-background rounded-lg border border-primary/30"
                  >
                    <select
                      value={lap.driver_id}
                      onChange={(e) => updateLapRow(lap.id, 'driver_id', e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm bg-background-secondary border border-gray-700 rounded focus:outline-none focus:border-primary"
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
                      className="w-28 px-3 py-1.5 text-sm bg-background-secondary border border-gray-700 rounded focus:outline-none focus:border-primary"
                    />
                    {lap.lap_time && (
                      <span className="w-20 text-primary font-mono text-sm">
                        {formatLapTime(parseFloat(lap.lap_time) || 0)}
                      </span>
                    )}
                    <button
                      onClick={() => removeLapRow(lap.id)}
                      className="p-1.5 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={saveNewLapsOnly}
                disabled={savingLaps}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-accent text-black rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {savingLaps ? 'Saving...' : 'Save New Laps'}
              </button>
            </div>
          )}

          {existingLaps.length === 0 && pendingLaps.length === 0 && (
            <p className="text-gray-400 text-center py-8 border border-gray-800 rounded-lg">
              No lap times recorded. Click &quot;Add Lap&quot; to add lap times.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
