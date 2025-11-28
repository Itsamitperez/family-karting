'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Race, Driver } from '@/types/database';

export default function NewLapPage() {
  const router = useRouter();
  const supabase = createClientSupabase();
  const [loading, setLoading] = useState(false);
  const [races, setRaces] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [formData, setFormData] = useState({
    race_id: '',
    driver_id: '',
    lap_time: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const [racesRes, driversRes] = await Promise.all([
        supabase.from('races').select('*, circuits(name)').order('race_date', { ascending: false }),
        supabase.from('drivers').select('*').order('name'),
      ]);
      if (racesRes.data) setRaces(racesRes.data);
      if (driversRes.data) setDrivers(driversRes.data);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const lapTimeSeconds = parseFloat(formData.lap_time);
      if (isNaN(lapTimeSeconds) || lapTimeSeconds <= 0) {
        throw new Error('Please enter a valid lap time');
      }

      const { error } = await supabase.from('laps').insert({
        race_id: formData.race_id,
        driver_id: formData.driver_id,
        lap_time: lapTimeSeconds,
      });

      if (error) throw error;

      // Recalculate race results if race is done
      const selectedRace = races.find((r) => r.id === formData.race_id);
      if (selectedRace?.status === 'done') {
        await calculateRaceResults(formData.race_id);
      }

      router.push('/admin/laps');
    } catch (err: any) {
      alert('Error creating lap: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateRaceResults = async (raceId: string) => {
    // Get all laps for this race
    const { data: laps } = await supabase
      .from('laps')
      .select('*, drivers(id, name)')
      .eq('race_id', raceId);

    if (!laps || laps.length === 0) return;

    // Get best lap time per driver
    const driverBestLaps = new Map<string, { driver_id: string; lap_time: number }>();
    laps.forEach((lap: any) => {
      const current = driverBestLaps.get(lap.driver_id);
      if (!current || lap.lap_time < current.lap_time) {
        driverBestLaps.set(lap.driver_id, {
          driver_id: lap.driver_id,
          lap_time: lap.lap_time,
        });
      }
    });

    // Sort by best lap time
    const sorted = Array.from(driverBestLaps.values()).sort((a, b) => a.lap_time - b.lap_time);

    // Assign positions and points
    const { getPointsForPosition } = await import('@/lib/utils');
    const updates = sorted.map((entry, index) => ({
      race_id: raceId,
      driver_id: entry.driver_id,
      position: index + 1,
      points: getPointsForPosition(index + 1),
    }));

    // Update race_drivers table
    for (const update of updates) {
      await supabase.from('race_drivers').upsert(update, {
        onConflict: 'race_id,driver_id',
      });
    }
  };

  return (
    <div>
      <Link
        href="/admin/laps"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft size={20} />
        Back to Laps
      </Link>

      <h1 className="text-4xl font-bold mb-8">New Lap</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Race *</label>
          <select
            required
            value={formData.race_id}
            onChange={(e) => setFormData({ ...formData, race_id: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="">Select a race</option>
            {races.map((race) => (
              <option key={race.id} value={race.id}>
                {race.circuits?.name} - {new Date(race.race_date).toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Driver *</label>
          <select
            required
            value={formData.driver_id}
            onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="">Select a driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Lap Time (seconds) *</label>
          <input
            type="number"
            step="0.001"
            required
            value={formData.lap_time}
            onChange={(e) => setFormData({ ...formData, lap_time: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
            placeholder="e.g., 45.123"
          />
          <p className="text-xs text-gray-500 mt-1">Enter time in seconds (e.g., 45.123 for 45.123 seconds)</p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Lap'}
          </button>
          <Link
            href="/admin/laps"
            className="px-6 py-2 bg-background-secondary border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

