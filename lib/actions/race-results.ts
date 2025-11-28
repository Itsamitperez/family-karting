'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { getPointsForPosition } from '@/lib/utils';

export async function calculateRaceResults(raceId: string) {
  const supabase = await createServerSupabase();

  // Get all laps for this race
  const { data: laps, error: lapsError } = await supabase
    .from('laps')
    .select('*, drivers(id, name)')
    .eq('race_id', raceId);

  if (lapsError || !laps || laps.length === 0) {
    return { error: 'No laps found for this race' };
  }

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
  const updates = sorted.map((entry, index) => ({
    race_id: raceId,
    driver_id: entry.driver_id,
    position: index + 1,
    points: getPointsForPosition(index + 1),
  }));

  // Update race_drivers table
  for (const update of updates) {
    const { error } = await supabase.from('race_drivers').upsert(update, {
      onConflict: 'race_id,driver_id',
    });
    if (error) {
      return { error: error.message };
    }
  }

  return { success: true };
}

