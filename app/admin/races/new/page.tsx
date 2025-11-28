'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Timer, Save } from 'lucide-react';
import { Circuit, Driver } from '@/types/database';
import { formatLapTime, getPointsForPosition, getCurrentDateTimeLocal } from '@/lib/utils';

type PendingLap = {
  id: string;
  driver_id: string;
  lap_time: string;
};

export default function NewRacePage() {
  const router = useRouter();
  const supabase = createClientSupabase();
  const [loading, setLoading] = useState(false);
  const [savingLaps, setSavingLaps] = useState(false);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [raceId, setRaceId] = useState<string | null>(null);
  const [pendingLaps, setPendingLaps] = useState<PendingLap[]>([]);
  const [formData, setFormData] = useState({
    race_date: getCurrentDateTimeLocal(),
    status: 'planned' as 'done' | 'scheduled' | 'planned',
    circuit_id: '',
    description: '',
    attachment_url: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const [circuitsRes, driversRes] = await Promise.all([
        supabase.from('circuits').select('*').order('name'),
        supabase.from('drivers').select('*').order('name'),
      ]);
      if (circuitsRes.data) setCircuits(circuitsRes.data);
      if (driversRes.data) setDrivers(driversRes.data);
    };
    fetchData();
  }, []);

  const handleCreateRace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.from('races').insert({
        race_date: new Date(formData.race_date).toISOString(),
        status: formData.status,
        circuit_id: formData.circuit_id,
        description: formData.description || null,
        attachment_url: formData.attachment_url || null,
      }).select().single();

      if (error) throw error;
      setRaceId(data.id);
      // Add first empty lap row
      addLapRow();
    } catch (err: any) {
      alert('Error creating race: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addLapRow = () => {
    setPendingLaps([...pendingLaps, { id: crypto.randomUUID(), driver_id: '', lap_time: '' }]);
  };

  const removeLapRow = (id: string) => {
    setPendingLaps(pendingLaps.filter(lap => lap.id !== id));
  };

  const updateLapRow = (id: string, field: 'driver_id' | 'lap_time', value: string) => {
    setPendingLaps(pendingLaps.map(lap => 
      lap.id === id ? { ...lap, [field]: value } : lap
    ));
  };

  const saveLaps = async () => {
    if (!raceId) return;
    
    // Filter out empty rows
    const validLaps = pendingLaps.filter(lap => lap.driver_id && lap.lap_time);
    if (validLaps.length === 0) {
      router.push('/admin/races');
      return;
    }

    setSavingLaps(true);
    try {
      // Insert all laps
      const lapsToInsert = validLaps.map(lap => ({
        race_id: raceId,
        driver_id: lap.driver_id,
        lap_time: parseFloat(lap.lap_time),
      }));

      const { error: lapsError } = await supabase.from('laps').insert(lapsToInsert);
      if (lapsError) throw lapsError;

      // Calculate race results if race is done
      if (formData.status === 'done') {
        await calculateRaceResults(raceId);
      }

      router.push('/admin/races');
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

  const skipLaps = () => {
    router.push('/admin/races');
  };

  // Phase 1: Create Race
  if (!raceId) {
    return (
      <div>
        <Link
          href="/admin/races"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          Back to Races
        </Link>

        <h1 className="text-4xl font-bold mb-8">New Race</h1>

        <form onSubmit={handleCreateRace} className="max-w-2xl space-y-6">
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
              rows={4}
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
              {loading ? 'Creating...' : 'Create Race & Add Laps'}
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
    );
  }

  // Phase 2: Add Laps
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Add Lap Times</h1>
        <p className="text-gray-400">
          Race created! Now add lap times for each driver. You can add multiple laps per driver.
        </p>
      </div>

      <div className="bg-background-secondary border border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Timer className="text-primary" size={24} />
            Lap Times
          </h2>
          <button
            onClick={addLapRow}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus size={16} />
            Add Lap
          </button>
        </div>

        {pendingLaps.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            Click &quot;Add Lap&quot; to add lap times for drivers
          </p>
        ) : (
          <div className="space-y-3">
            {pendingLaps.map((lap, index) => (
              <div
                key={lap.id}
                className="flex items-center gap-4 p-4 bg-background rounded-lg border border-gray-700"
              >
                <span className="text-gray-400 w-8">#{index + 1}</span>
                <div className="flex-1">
                  <select
                    value={lap.driver_id}
                    onChange={(e) => updateLapRow(lap.id, 'driver_id', e.target.value)}
                    className="w-full px-4 py-2 bg-background-secondary border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="">Select driver</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-40">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Time (sec)"
                    value={lap.lap_time}
                    onChange={(e) => updateLapRow(lap.id, 'lap_time', e.target.value)}
                    className="w-full px-4 py-2 bg-background-secondary border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                {lap.lap_time && (
                  <div className="w-24 text-primary font-mono text-sm">
                    {formatLapTime(parseFloat(lap.lap_time) || 0)}
                  </div>
                )}
                <button
                  onClick={() => removeLapRow(lap.id)}
                  className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={saveLaps}
          disabled={savingLaps}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {savingLaps ? 'Saving...' : 'Save & Finish'}
        </button>
        <button
          onClick={skipLaps}
          className="px-6 py-2 bg-background-secondary border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
        >
          Skip (Add laps later)
        </button>
      </div>
    </div>
  );
}
