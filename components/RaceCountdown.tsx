'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Timer, MapPin, ChevronRight, Flag, Gauge } from 'lucide-react';

type CountdownTime = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
};

type NextRace = {
  id: string;
  race_date: string;
  race_type: 'race' | 'testing';
  description: string | null;
  circuit: {
    name: string;
    photo_url: string | null;
  };
};

function calculateTimeLeft(targetDate: string): CountdownTime {
  const difference = new Date(targetDate).getTime() - new Date().getTime();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-electric-red/20 to-electric-red/5 
          border border-electric-red/30 flex items-center justify-center
          shadow-lg shadow-electric-red/10">
          <span className="font-f1 text-2xl sm:text-3xl font-bold text-electric-red tabular-nums">
            {value.toString().padStart(2, '0')}
          </span>
        </div>
        {/* Decorative corner */}
        <div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-electric-red/50 rounded-tr-lg" />
        <div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-electric-red/50 rounded-bl-lg" />
      </div>
      <span className="text-xs sm:text-sm text-soft-white/40 mt-2 uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}

export default function RaceCountdown({ race }: { race: NextRace }) {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>(() => calculateTimeLeft(race.race_date));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(race.race_date));
    }, 1000);

    return () => clearInterval(timer);
  }, [race.race_date]);

  // Avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="glass-card rounded-3xl p-6 sm:p-8 animate-pulse">
        <div className="h-40 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  const raceDate = new Date(race.race_date);
  const isToday = new Date().toDateString() === raceDate.toDateString();
  const isRaceTime = timeLeft.total <= 0;

  return (
    <div className="relative overflow-hidden glass-card rounded-3xl animate-slide-up">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 10px,
            currentColor 10px,
            currentColor 11px
          )`
        }} />
      </div>
      
      {/* Animated glow effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-electric-red/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-velocity-yellow/10 rounded-full blur-2xl" />
      
      <div className="relative p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-electric-red/20 flex items-center justify-center">
              <Flag size={20} className="text-electric-red" />
            </div>
            <div>
              <p className="text-xs font-medium text-electric-red uppercase tracking-wider">
                {isRaceTime ? 'Race Time!' : isToday ? 'Racing Today!' : 'Next Race'}
              </p>
              <h2 className="font-f1 text-lg sm:text-xl font-bold text-soft-white">
                {race.circuit.name}
              </h2>
            </div>
          </div>
          
          {race.race_type === 'testing' && (
            <span className="px-3 py-1 text-xs rounded-full font-semibold bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30">
              <Gauge size={12} className="inline mr-1" />
              Testing
            </span>
          )}
        </div>

        {/* Countdown or Race Time */}
        {isRaceTime ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl 
              bg-green-lime/20 border border-green-lime/30 animate-pulse-glow">
              <Timer size={24} className="text-green-lime" />
              <span className="font-f1 text-xl font-bold text-green-lime">
                Race is Happening Now!
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
            <CountdownUnit value={timeLeft.days} label="Days" />
            <div className="text-electric-red/50 font-bold text-2xl pb-6">:</div>
            <CountdownUnit value={timeLeft.hours} label="Hours" />
            <div className="text-electric-red/50 font-bold text-2xl pb-6">:</div>
            <CountdownUnit value={timeLeft.minutes} label="Mins" />
            <div className="text-electric-red/50 font-bold text-2xl pb-6 hidden sm:block">:</div>
            <div className="hidden sm:block">
              <CountdownUnit value={timeLeft.seconds} label="Secs" />
            </div>
          </div>
        )}

        {/* Race Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-soft-white/50">
              <MapPin size={16} />
              <span className="text-sm">
                {raceDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            {race.description && (
              <p className="text-sm text-soft-white/40 hidden md:block">
                • {race.description}
              </p>
            )}
          </div>
          
          <Link
            href={`/races/${race.id}`}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-electric-red/10 text-electric-red font-semibold text-sm
              border border-electric-red/20
              hover:bg-electric-red hover:text-white
              transition-all duration-300"
          >
            View Details
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

