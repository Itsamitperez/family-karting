'use client';

import CountingNumber from './CountingNumber';

interface StatsSectionProps {
  racesCount: number;
  lapsCount: number;
  circuitsCount: number;
  memoriesCount: number;
}

export default function StatsSection({ racesCount, lapsCount, circuitsCount, memoriesCount }: StatsSectionProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="glass-card rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center">
              <p className="font-f1 text-4xl md:text-5xl font-bold text-electric-red mb-2">
                <CountingNumber value={racesCount} duration={1500} />
              </p>
              <p className="text-sm text-soft-white/50">Races Tracked</p>
            </div>
            <div className="text-center">
              <p className="font-f1 text-4xl md:text-5xl font-bold text-aqua-neon mb-2">
                <CountingNumber value={lapsCount} duration={1800} />
              </p>
              <p className="text-sm text-soft-white/50">Lap Times</p>
            </div>
            <div className="text-center">
              <p className="font-f1 text-4xl md:text-5xl font-bold text-cyber-purple mb-2">
                <CountingNumber value={circuitsCount} duration={1200} />
              </p>
              <p className="text-sm text-soft-white/50">Circuits</p>
            </div>
            <div className="text-center">
              <p className="font-f1 text-4xl md:text-5xl font-bold text-velocity-yellow mb-2">
                <CountingNumber value={memoriesCount} duration={2000} />
              </p>
              <p className="text-sm text-soft-white/50">Memories</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

