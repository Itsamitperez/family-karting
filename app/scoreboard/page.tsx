import { createServerSupabase } from '@/lib/supabase/server';
import { Trophy } from 'lucide-react';
import { ScoreboardEntry } from '@/types/database';
import ScoreboardClient from '@/components/ScoreboardClient';

interface RaceResult {
  race_id: string;
  driver_id: string;
  position: number | null;
  points: number | null;
  race_date: string;
  circuit_name: string;
}

export default async function ScoreboardPage() {
  const supabase = await createServerSupabase();

  // Get all race drivers with points and race details (only from actual races, not testing)
  const { data: raceDrivers } = await supabase
    .from('race_drivers')
    .select('*, drivers(name, id), races(id, race_date, race_type, circuits(name))')
    .not('points', 'is', null);

  // Filter out testing races - only count actual races for the scoreboard
  const actualRaceDrivers = raceDrivers?.filter((rd: any) => {
    // Include races where race_type is 'race' or null/undefined (for backwards compatibility with existing data)
    return rd.races?.race_type !== 'testing';
  });

  // Aggregate points by driver
  const driverStats = new Map<string, ScoreboardEntry>();
  const driverRaceResults = new Map<string, RaceResult[]>();

  actualRaceDrivers?.forEach((rd: any) => {
    const driverId = rd.driver_id;
    const driverName = rd.drivers?.name || 'Unknown';
    const points = rd.points || 0;
    const raceDate = rd.races?.race_date;

    // Overall stats
    if (!driverStats.has(driverId)) {
      driverStats.set(driverId, {
        driver_id: driverId,
        driver_name: driverName,
        total_points: 0,
        races_count: 0,
        wins: 0,
      });
      driverRaceResults.set(driverId, []);
    }

    const stats = driverStats.get(driverId)!;
    stats.total_points += points;
    stats.races_count += 1;
    if (rd.position === 1) {
      stats.wins += 1;
    }

    // Store race result
    driverRaceResults.get(driverId)!.push({
      race_id: rd.races?.id || rd.race_id,
      driver_id: driverId,
      position: rd.position,
      points: rd.points,
      race_date: raceDate,
      circuit_name: rd.races?.circuits?.name || 'Unknown',
    });
  });

  // Convert to array and sort
  const overallLeaderboard: ScoreboardEntry[] = Array.from(driverStats.values()).sort(
    (a, b) => b.total_points - a.total_points
  );

  // Get yearly leaderboards
  const years = new Set<number>();
  actualRaceDrivers?.forEach((rd: any) => {
    if (rd.races?.race_date) {
      years.add(new Date(rd.races.race_date).getFullYear());
    }
  });

  const yearlyLeaderboards: Record<number, ScoreboardEntry[]> = {};
  const yearlyRaceResults: Record<number, Record<string, RaceResult[]>> = {};

  Array.from(years).forEach((year) => {
    const yearStats = new Map<string, ScoreboardEntry>();
    const yearRaceResults = new Map<string, RaceResult[]>();

    actualRaceDrivers?.forEach((rd: any) => {
      if (!rd.races?.race_date) return;
      const raceYear = new Date(rd.races.race_date).getFullYear();
      if (raceYear !== year) return;

      const driverId = rd.driver_id;
      const driverName = rd.drivers?.name || 'Unknown';
      const points = rd.points || 0;

      if (!yearStats.has(driverId)) {
        yearStats.set(driverId, {
          driver_id: driverId,
          driver_name: driverName,
          total_points: 0,
          races_count: 0,
          wins: 0,
        });
        yearRaceResults.set(driverId, []);
      }

      const stats = yearStats.get(driverId)!;
      stats.total_points += points;
      stats.races_count += 1;
      if (rd.position === 1) {
        stats.wins += 1;
      }

      yearRaceResults.get(driverId)!.push({
        race_id: rd.races?.id || rd.race_id,
        driver_id: driverId,
        position: rd.position,
        points: rd.points,
        race_date: rd.races.race_date,
        circuit_name: rd.races?.circuits?.name || 'Unknown',
      });
    });

    yearlyLeaderboards[year] = Array.from(yearStats.values()).sort(
      (a, b) => b.total_points - a.total_points
    );
    
    yearlyRaceResults[year] = Object.fromEntries(yearRaceResults);
  });

  // Convert overall race results to object
  const overallRaceResults = Object.fromEntries(driverRaceResults);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-electric-red flex items-center justify-center shadow-glow-red">
              <Trophy size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-soft-white/40 uppercase tracking-wider">
                Championships
              </p>
              <h1 className="font-f1 text-3xl md:text-4xl font-bold text-soft-white">
                Scoreboard
              </h1>
            </div>
          </div>
          <p className="text-soft-white/50 mt-2 max-w-2xl">
            The ultimate ranking of family karting legends. Points, wins, and glory.
          </p>
        </div>

        {/* Scoreboard Client with all data */}
        <ScoreboardClient
          overallLeaderboard={overallLeaderboard}
          yearlyLeaderboards={yearlyLeaderboards}
          overallRaceResults={overallRaceResults}
          yearlyRaceResults={yearlyRaceResults}
        />
      </div>
    </div>
  );
}
