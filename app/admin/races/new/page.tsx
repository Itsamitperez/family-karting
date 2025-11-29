'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Timer, Save, Loader2 } from 'lucide-react';
import { Circuit, Driver } from '@/types/database';
import { formatLapTime, getPointsForPosition, getCurrentDateTimeLocal } from '@/lib/utils';
import ImageUpload from '@/components/ui/ImageUpload';

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
    race_type: 'race' as 'race' | 'testing',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateRace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.from('races').insert({
        race_date: new Date(formData.race_date).toISOString(),
        status: formData.status,
        race_type: formData.race_type,
        circuit_id: formData.circuit_id,
        description: formData.description || null,
        attachment_url: formData.attachment_url || null,
      }).select().single();

      if (error) throw error;
      setRaceId(data.id);
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
    
    const validLaps = pendingLaps.filter(lap => lap.driver_id && lap.lap_time);
    if (validLaps.length === 0) {
      router.push('/admin/races');
      return;
    }

    setSavingLaps(true);
    try {
      const lapsToInsert = validLaps.map(lap => ({
        race_id: raceId,
        driver_id: lap.driver_id,
        lap_time: parseFloat(lap.lap_time),
      }));

      const { error: lapsError } = await supabase.from('laps').insert(lapsToInsert);
      if (lapsError) throw lapsError;

      // Only calculate results for actual races, not testing sessions
      if (formData.status === 'done' && formData.race_type === 'race') {
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

  const skipLaps = () => {
    router.push('/admin/races');
  };

  const inputClass = `w-full px-4 py-3 bg-[#1a1a2e] border border-white/30 rounded-xl 
    text-soft-white placeholder-soft-white/50
    focus:outline-none focus:border-velocity-yellow focus:ring-2 focus:ring-velocity-yellow/40
    transition-all`;

  // Phase 1: Create Race
  if (!raceId) {
    return (
      <div>
        <Link
          href="/admin/races"
          className="inline-flex items-center gap-2 text-soft-white/60 hover:text-soft-white mb-6 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Races
        </Link>

        <h1 className="font-f1 text-3xl font-bold text-soft-white mb-8">New Race</h1>

        <form onSubmit={handleCreateRace} className="max-w-2xl space-y-6">
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
                rows={4}
                className={inputClass}
                placeholder="Add notes about this race..."
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
                  Creating...
                </>
              ) : (
                'Create Race & Add Laps'
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
    );
  }

  // Phase 2: Add Laps
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-f1 text-3xl font-bold text-soft-white mb-2">Add Lap Times</h1>
        <p className="text-soft-white/50">
          Race created! Now add lap times for each driver. You can add multiple laps per driver.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-f1 text-xl font-bold text-soft-white flex items-center gap-2">
            <Timer className="text-electric-red" size={24} />
            Lap Times
          </h2>
          <button
            onClick={addLapRow}
            className="flex items-center gap-2 px-4 py-2 bg-electric-red text-white rounded-xl 
              font-medium hover:bg-electric-red-light transition-colors"
          >
            <Plus size={16} />
            Add Lap
          </button>
        </div>

        {pendingLaps.length === 0 ? (
          <p className="text-soft-white/40 text-center py-8">
            Click &quot;Add Lap&quot; to add lap times for drivers
          </p>
        ) : (
          <div className="space-y-3">
            {pendingLaps.map((lap, index) => (
              <div
                key={lap.id}
                className="flex items-center gap-4 p-4 bg-deep-charcoal rounded-xl border border-white/10"
              >
                <span className="text-soft-white/40 w-8 font-f1 font-bold">#{index + 1}</span>
                <div className="flex-1">
                  <select
                    value={lap.driver_id}
                    onChange={(e) => updateLapRow(lap.id, 'driver_id', e.target.value)}
                    className={inputClass}
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
                    className={inputClass}
                  />
                </div>
                {lap.lap_time && (
                  <div className="w-24 text-electric-red font-f1 font-bold text-sm">
                    {formatLapTime(parseFloat(lap.lap_time) || 0)}
                  </div>
                )}
                <button
                  onClick={() => removeLapRow(lap.id)}
                  className="p-2 text-electric-red hover:bg-electric-red/10 rounded-lg transition-colors"
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
          className="flex items-center gap-2 px-6 py-3 bg-electric-red text-white rounded-xl 
            font-semibold hover:bg-electric-red-light hover:shadow-glow-red transition-all 
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {savingLaps ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save & Finish
            </>
          )}
        </button>
        <button
          onClick={skipLaps}
          className="px-6 py-3 bg-white/5 border border-white/10 text-soft-white rounded-xl 
            hover:bg-white/10 hover:border-white/20 transition-all font-medium"
        >
          Skip (Add laps later)
        </button>
      </div>
    </div>
  );
}
