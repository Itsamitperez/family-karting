'use client';

import { useState } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { ScoreboardEntry } from '@/types/database';

export default function ScoreboardClient({
  overallLeaderboard,
  yearlyLeaderboards,
}: {
  overallLeaderboard: ScoreboardEntry[];
  yearlyLeaderboards: Record<number, ScoreboardEntry[]>;
}) {
  const [selectedYear, setSelectedYear] = useState<number | 'overall'>('overall');

  const currentLeaderboard =
    selectedYear === 'overall'
      ? overallLeaderboard
      : yearlyLeaderboards[selectedYear] || [];

  const years = Object.keys(yearlyLeaderboards)
    .map(Number)
    .sort((a, b) => b - a);

  const getMedalColor = (position: number) => {
    if (position === 1) return 'text-yellow-400';
    if (position === 2) return 'text-gray-300';
    if (position === 3) return 'text-orange-400';
    return 'text-gray-500';
  };

  return (
    <div>
      {/* Year selector */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedYear('overall')}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            selectedYear === 'overall'
              ? 'bg-primary border-primary text-white'
              : 'bg-background-secondary border-gray-800 text-gray-400 hover:border-primary'
          }`}
        >
          Overall
        </button>
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              selectedYear === year
                ? 'bg-primary border-primary text-white'
                : 'bg-background-secondary border-gray-800 text-gray-400 hover:border-primary'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {currentLeaderboard.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No data available for this period.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentLeaderboard.map((entry, index) => {
            const position = index + 1;
            return (
              <div
                key={entry.driver_id}
                className={`bg-background-secondary border rounded-lg p-6 ${
                  position === 1
                    ? 'border-primary glow-primary'
                    : position === 2
                    ? 'border-accent'
                    : position === 3
                    ? 'border-accent-neon'
                    : 'border-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center justify-center w-16">
                      {position <= 3 ? (
                        <Medal className={getMedalColor(position)} size={32} />
                      ) : (
                        <span className="text-2xl font-bold text-gray-500">#{position}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{entry.driver_name}</h3>
                      <div className="flex gap-4 mt-1 text-sm text-gray-400">
                        <span>{entry.races_count} races</span>
                        {entry.wins > 0 && <span>{entry.wins} wins</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{entry.total_points}</p>
                    <p className="text-sm text-gray-400">points</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

