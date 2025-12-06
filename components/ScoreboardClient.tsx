'use client';

import { useState, useMemo, memo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Medal, TrendingUp, Flag, X, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { ScoreboardEntry } from '@/types/database';

interface RaceResult {
  race_id: string;
  driver_id: string;
  position: number | null;
  points: number | null;
  race_date: string;
  circuit_name: string;
}

interface ScoreboardClientProps {
  overallLeaderboard: ScoreboardEntry[];
  yearlyLeaderboards: Record<number, ScoreboardEntry[]>;
  overallRaceResults?: Record<string, RaceResult[]>;
  yearlyRaceResults?: Record<number, Record<string, RaceResult[]>>;
}

// Memoized Race Result Item Component
const RaceResultItem = memo(({ result, onClose }: { result: RaceResult; onClose: () => void }) => {
  const formattedDate = useMemo(
    () => new Date(result.race_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    [result.race_date]
  );

  return (
    <Link
      href={`/races/${result.race_id}`}
      onClick={onClose}
      className="group flex items-center justify-between p-4 rounded-xl
        bg-deep-charcoal border border-white/10 hover:border-electric-red/30 transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Position Badge */}
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          font-f1 font-bold text-base shadow-lg
          ${result.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' : ''}
          ${result.position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' : ''}
          ${result.position === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' : ''}
          ${!result.position || result.position > 3 ? 'bg-white/10 text-soft-white/60' : ''}
        `}>
          {result.position || '-'}
        </div>

        <div>
          <p className="text-base font-semibold text-soft-white group-hover:text-white transition-colors">
            {result.circuit_name}
          </p>
          <p className="text-sm text-soft-white/50">
            {formattedDate}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {result.points !== null && (
          <div className="text-right">
            <p className="font-f1 text-lg font-bold text-electric-red">
              +{result.points}
            </p>
            <p className="text-xs text-soft-white/40">pts</p>
          </div>
        )}
        <ChevronRight size={18} className="text-soft-white/30 
          group-hover:text-electric-red group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
});
RaceResultItem.displayName = 'RaceResultItem';

// Memoized Driver Entry Component
const DriverEntry = memo(({ 
  entry, 
  position, 
  hasValidPodium, 
  onClick 
}: { 
  entry: ScoreboardEntry; 
  position: number; 
  hasValidPodium: boolean; 
  onClick: () => void;
}) => {
  const animationDelay = useMemo(
    () => (position - (hasValidPodium ? 4 : 1)) * 30,
    [position, hasValidPodium]
  );

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left glass-card rounded-2xl p-4 md:p-5
        animate-slide-up opacity-0
        hover:border-white/20 transition-all cursor-pointer
        ${position <= 3 && !hasValidPodium
          ? position === 1 
            ? 'border-2 border-velocity-yellow/30' 
            : position === 2 
              ? 'border-2 border-gray-400/30' 
              : 'border-2 border-amber-600/30'
          : ''
        }
      `}
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center gap-4">
        {/* Position */}
        <div className={`
          w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center
          font-f1 font-bold text-lg
          ${position === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' : ''}
          ${position === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' : ''}
          ${position === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' : ''}
          ${position > 3 ? 'bg-white/10 text-soft-white/60' : ''}
        `}>
          {position}
        </div>

        {/* Driver Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-f1 text-lg md:text-xl font-bold text-soft-white truncate">
            {entry.driver_name}
          </h3>
          <div className="flex items-center gap-4 mt-0.5">
            <span className="text-xs md:text-sm text-soft-white/40 flex items-center gap-1">
              <Flag size={12} />
              {entry.races_count} races
            </span>
            {entry.wins > 0 && (
              <span className="text-xs md:text-sm text-velocity-yellow flex items-center gap-1">
                <Trophy size={12} />
                {entry.wins} wins
              </span>
            )}
          </div>
        </div>

        {/* Points */}
        <div className="text-right">
          <p className={`
            font-f1 text-2xl md:text-3xl font-bold
            ${position === 1 ? 'text-velocity-yellow' : ''}
            ${position === 2 ? 'text-gray-400' : ''}
            ${position === 3 ? 'text-amber-600' : ''}
            ${position > 3 ? 'text-electric-red' : ''}
          `}>
            {entry.total_points}
          </p>
          <p className="text-xs text-soft-white/40">pts</p>
        </div>
      </div>
    </button>
  );
});
DriverEntry.displayName = 'DriverEntry';

export default function ScoreboardClient({
  overallLeaderboard,
  yearlyLeaderboards,
  overallRaceResults = {},
  yearlyRaceResults = {},
}: ScoreboardClientProps) {
  const [selectedYear, setSelectedYear] = useState<number | 'overall'>('overall');
  const [selectedDriver, setSelectedDriver] = useState<ScoreboardEntry | null>(null);

  // Memoize current leaderboard
  const currentLeaderboard = useMemo(
    () => selectedYear === 'overall'
      ? overallLeaderboard
      : yearlyLeaderboards[selectedYear] || [],
    [selectedYear, overallLeaderboard, yearlyLeaderboards]
  );

  // Memoize years array
  const years = useMemo(
    () => Object.keys(yearlyLeaderboards)
      .map(Number)
      .sort((a, b) => b - a),
    [yearlyLeaderboards]
  );

  // Memoize sorted race results for selected driver (pre-sorted to avoid re-sorting on every render)
  const driverRaceResults = useMemo(() => {
    if (!selectedDriver) return [];
    
    const results = selectedYear === 'overall'
      ? overallRaceResults[selectedDriver.driver_id] || []
      : yearlyRaceResults[selectedYear]?.[selectedDriver.driver_id] || [];
    
    // Sort once and memoize - sort by date descending
    return [...results].sort(
      (a, b) => new Date(b.race_date).getTime() - new Date(a.race_date).getTime()
    );
  }, [selectedDriver, selectedYear, overallRaceResults, yearlyRaceResults]);

  // Memoize podium
  const podium = useMemo(() => currentLeaderboard.slice(0, 3), [currentLeaderboard]);
  const hasValidPodium = useMemo(() => podium.length >= 3, [podium.length]);

  // Memoize remaining leaderboard
  const remainingLeaderboard = useMemo(
    () => currentLeaderboard.slice(3),
    [currentLeaderboard]
  );

  // Memoize callbacks
  const handleYearChange = useCallback((year: number | 'overall') => {
    setSelectedYear(year);
    setSelectedDriver(null); // Close modal when changing year
  }, []);

  const handleDriverSelect = useCallback((driver: ScoreboardEntry) => {
    setSelectedDriver(driver);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedDriver(null);
  }, []);

  // Prevent body scroll when modal is open (mobile optimization)
  useEffect(() => {
    if (selectedDriver) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      return () => {
        // Unlock body scroll
        document.body.style.overflow = '';
      };
    }
  }, [selectedDriver]);

  return (
    <div>
      {/* Year Filter - Above Everything */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-soft-white/40 mr-2">Filter by:</span>
          <button
            onClick={() => handleYearChange('overall')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              selectedYear === 'overall'
                ? 'bg-electric-red text-white shadow-glow-red'
                : 'bg-white/5 text-soft-white/60 hover:bg-white/10 hover:text-soft-white'
            }`}
          >
            All Time
          </button>
          {years.map((year) => (
            <button
              key={year}
              onClick={() => handleYearChange(year)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                selectedYear === year
                  ? 'bg-electric-red text-white shadow-glow-red'
                  : 'bg-white/5 text-soft-white/60 hover:bg-white/10 hover:text-soft-white'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Section */}
      {hasValidPodium && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Medal size={18} className="text-velocity-yellow" />
            <h2 className="font-f1 text-lg font-bold text-soft-white">
              {selectedYear === 'overall' ? 'All Time Podium' : `${selectedYear} Podium`}
            </h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          
          <div className="grid grid-cols-3 gap-3 md:gap-6 items-end">
            {/* 2nd Place */}
            <button
              onClick={() => handleDriverSelect(podium[1])}
              className="glass-card rounded-3xl p-4 md:p-6 text-center hover:border-gray-400/30 
                transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 rounded-full 
                bg-gradient-to-br from-gray-300 to-gray-500 
                flex items-center justify-center shadow-lg
                group-hover:scale-110 transition-transform">
                <span className="font-f1 text-xl md:text-2xl font-bold text-black">2</span>
              </div>
              <h3 className="font-f1 text-base md:text-xl font-bold text-soft-white truncate
                group-hover:text-white transition-colors">
                {podium[1].driver_name}
              </h3>
              <p className="font-f1 text-2xl md:text-3xl font-bold text-gray-400 mt-2">
                {podium[1].total_points}
              </p>
              <p className="text-xs text-soft-white/40 mt-1">points</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-xs text-soft-white/40">
                <span>{podium[1].wins} wins</span>
                <span>•</span>
                <span>{podium[1].races_count} races</span>
              </div>
            </button>

            {/* 1st Place */}
            <button
              onClick={() => handleDriverSelect(podium[0])}
              className="glass-card rounded-3xl p-4 md:p-8 text-center 
                border-2 border-velocity-yellow/30 relative overflow-hidden
                hover:border-velocity-yellow/50 transition-all cursor-pointer group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-velocity-yellow/10 to-transparent" />
              <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 rounded-full 
                  bg-gradient-to-br from-yellow-400 to-yellow-600 
                  flex items-center justify-center shadow-lg shadow-yellow-500/30
                  group-hover:scale-110 transition-transform">
                  <Trophy size={28} className="text-black" />
                </div>
                <h3 className="font-f1 text-lg md:text-2xl font-bold text-velocity-yellow truncate
                  group-hover:text-white transition-colors">
                  {podium[0].driver_name}
                </h3>
                <p className="font-f1 text-3xl md:text-4xl font-bold text-velocity-yellow mt-2">
                  {podium[0].total_points}
                </p>
                <p className="text-xs text-velocity-yellow/60 mt-1">points</p>
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-soft-white/50">
                  <span>{podium[0].wins} wins</span>
                  <span>{podium[0].races_count} races</span>
                </div>
              </div>
            </button>

            {/* 3rd Place */}
            <button
              onClick={() => handleDriverSelect(podium[2])}
              className="glass-card rounded-3xl p-4 md:p-6 text-center hover:border-amber-600/30 
                transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 rounded-full 
                bg-gradient-to-br from-amber-600 to-amber-800 
                flex items-center justify-center shadow-lg
                group-hover:scale-110 transition-transform">
                <span className="font-f1 text-xl md:text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="font-f1 text-base md:text-xl font-bold text-soft-white truncate
                group-hover:text-white transition-colors">
                {podium[2].driver_name}
              </h3>
              <p className="font-f1 text-2xl md:text-3xl font-bold text-amber-600 mt-2">
                {podium[2].total_points}
              </p>
              <p className="text-xs text-soft-white/40 mt-1">points</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-xs text-soft-white/40">
                <span>{podium[2].wins} wins</span>
                <span>•</span>
                <span>{podium[2].races_count} races</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Full Standings */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={18} className="text-soft-white/40" />
          <h2 className="font-f1 text-lg font-bold text-soft-white">
            {hasValidPodium ? 'Full Standings' : 'Standings'}
          </h2>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {currentLeaderboard.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-soft-white/20" />
            <p className="text-soft-white/50 text-lg">No standings data available.</p>
            <p className="text-soft-white/30 text-sm mt-2">Complete some races to see the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(hasValidPodium ? remainingLeaderboard : currentLeaderboard).map((entry, index) => {
              const position = hasValidPodium ? index + 4 : index + 1;
              
              return (
                <DriverEntry
                  key={entry.driver_id}
                  entry={entry}
                  position={position}
                  hasValidPodium={hasValidPodium}
                  onClick={() => handleDriverSelect(entry)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Driver Details Modal */}
      {selectedDriver && (
        <div 
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          
          {/* Modal */}
          <div 
            className="relative w-full max-w-lg max-h-[80vh] overflow-hidden
              bg-steel-gray rounded-t-3xl md:rounded-3xl
              border border-white/10 shadow-2xl
              animate-slide-up
              will-change-transform"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-steel-gray border-b border-white/10 p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-soft-white/40 uppercase tracking-wider mb-1">
                    {selectedYear === 'overall' ? 'All Time' : selectedYear} Results
                  </p>
                  <h2 className="font-f1 text-2xl font-bold text-soft-white">
                    {selectedDriver.driver_name}
                  </h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center
                    hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-soft-white/60" />
                </button>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-electric-red/10 border border-electric-red/20 rounded-xl p-3 text-center">
                  <p className="font-f1 text-xl font-bold text-electric-red">
                    {selectedDriver.total_points}
                  </p>
                  <p className="text-xs text-soft-white/40">Points</p>
                </div>
                <div className="bg-velocity-yellow/10 border border-velocity-yellow/20 rounded-xl p-3 text-center">
                  <p className="font-f1 text-xl font-bold text-velocity-yellow">
                    {selectedDriver.wins}
                  </p>
                  <p className="text-xs text-soft-white/40">Wins</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="font-f1 text-xl font-bold text-soft-white">
                    {selectedDriver.races_count}
                  </p>
                  <p className="text-xs text-soft-white/40">Races</p>
                </div>
              </div>
            </div>

            {/* Race Results List */}
            <div className="p-4 md:p-6 overflow-y-auto max-h-[50vh] overscroll-contain">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-cyber-purple" />
                <h3 className="font-semibold text-soft-white">Race History</h3>
              </div>

              {driverRaceResults.length > 0 ? (
                <div className="space-y-2">
                  {driverRaceResults.map((result) => (
                    <RaceResultItem 
                      key={`${result.race_id}-${result.race_date}`}
                      result={result} 
                      onClose={handleCloseModal}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-soft-white/40 py-8">
                  No race results found for this period.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-steel-gray border-t border-white/10 p-4">
              <Link
                href={`/drivers/${selectedDriver.driver_id}`}
                onClick={handleCloseModal}
                className="block w-full py-3 rounded-xl bg-electric-red text-white 
                  font-semibold text-center hover:bg-electric-red-light transition-colors"
              >
                View Full Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
