'use client';

export default function RacingBackground() {
  return (
    <div className="racing-bg" aria-hidden="true">
      {/* Additional light streaks for rainy night effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Vertical light streaks */}
        <div className="absolute top-0 left-[10%] w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        <div className="absolute top-0 left-[30%] w-px h-full bg-gradient-to-b from-transparent via-electric-red/10 to-transparent" />
        <div className="absolute top-0 left-[50%] w-px h-full bg-gradient-to-b from-transparent via-white/3 to-transparent" />
        <div className="absolute top-0 left-[70%] w-px h-full bg-gradient-to-b from-transparent via-aqua-neon/5 to-transparent" />
        <div className="absolute top-0 left-[90%] w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        
        {/* Ambient orbs */}
        <div className="absolute top-[20%] left-[15%] w-64 h-64 bg-electric-red/10 rounded-full blur-[100px]" />
        <div className="absolute top-[60%] right-[10%] w-96 h-96 bg-cyber-purple/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[40%] w-80 h-80 bg-aqua-neon/5 rounded-full blur-[100px]" />
      </div>
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

