'use client';

import Link from 'next/link';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* 404 Display */}
        <div className="relative mb-8">
          <h1 className="font-f1 text-[120px] md:text-[180px] font-bold text-electric-red/20 leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-electric-red/10 
              flex items-center justify-center animate-pulse">
              <AlertTriangle size={40} className="text-electric-red" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="font-f1 text-2xl md:text-3xl font-bold text-soft-white mb-3">
          Off Track!
        </h2>
        <p className="text-soft-white/50 mb-8">
          Looks like you&apos;ve taken a wrong turn. This page doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl
              bg-electric-red text-white font-semibold
              hover:shadow-glow-red transition-all duration-200"
          >
            <Home size={18} />
            Back to Pit Lane
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl
              bg-white/5 text-soft-white/70 font-semibold
              hover:bg-white/10 hover:text-soft-white transition-all duration-200"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
