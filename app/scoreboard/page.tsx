import { createServerSupabase } from '@/lib/supabase/server';
import { Trophy } from 'lucide-react';
import { ScoreboardEntry } from '@/types/database';
import ScoreboardClient from '@/components/ScoreboardClient';

export default async function ScoreboardPage() {
  const supabase = await createServerSupabase();

  // Get all race drivers with points
  const { data: raceDrivers } = await supabase
    .from('race_drivers')
    .select('*, drivers(name, id), races(race_date)')
    .not('points', 'is', null);

  // Aggregate points by driver
  const driverStats = new Map<string, ScoreboardEntry>();

  raceDrivers?.forEach((rd: any) => {
    const driverId = rd.driver_id;
    const driverName = rd.drivers?.name || 'Unknown';
    const points = rd.points || 0;
    const raceDate = rd.races?.date;
    const year = raceDate ? new Date(raceDate).getFullYear() : null;

    // Overall stats
    if (!driverStats.has(driverId)) {
      driverStats.set(driverId, {
        driver_id: driverId,
        driver_name: driverName,
        total_points: 0,
        races_count: 0,
        wins: 0,
      });
    }

    const stats = driverStats.get(driverId)!;
    stats.total_points += points;
    stats.races_count += 1;
    if (rd.position === 1) {
      stats.wins += 1;
    }
  });

  // Convert to array and sort
  const overallLeaderboard: ScoreboardEntry[] = Array.from(driverStats.values()).sort(
    (a, b) => b.total_points - a.total_points
  );

  // Get yearly leaderboards
  const years = new Set<number>();
  raceDrivers?.forEach((rd: any) => {
    if (rd.races?.race_date) {
      years.add(new Date(rd.races.race_date).getFullYear());
    }
  });

  const yearlyLeaderboards: Record<number, ScoreboardEntry[]> = {};

  Array.from(years).forEach((year) => {
    const yearStats = new Map<string, ScoreboardEntry>();

    raceDrivers?.forEach((rd: any) => {
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
      }

      const stats = yearStats.get(driverId)!;
      stats.total_points += points;
      stats.races_count += 1;
      if (rd.position === 1) {
        stats.wins += 1;
      }
    });

    yearlyLeaderboards[year] = Array.from(yearStats.values()).sort(
      (a, b) => b.total_points - a.total_points
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-4">
          <Trophy className="text-primary" size={48} />
          Scoreboard
        </h1>
        <p className="text-gray-400 mb-12">Overall and yearly rankings</p>

        <ScoreboardClient
          overallLeaderboard={overallLeaderboard}
          yearlyLeaderboards={yearlyLeaderboards}
        />
      </div>
    </div>
  );
}

