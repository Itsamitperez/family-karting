import Link from 'next/link';
import { Trophy, MapPin, Users, Calendar } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-slide-in">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Family Karting
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Track your racing legacy. Compete. Improve. Win.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Link
            href="/circuits"
            className="group relative bg-background-secondary border border-gray-800 rounded-lg p-6 hover:border-primary transition-all duration-300 hover:glow-primary"
          >
            <MapPin className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold mb-2">Circuits</h2>
            <p className="text-gray-400">Explore all racing circuits</p>
          </Link>

          <Link
            href="/drivers"
            className="group relative bg-background-secondary border border-gray-800 rounded-lg p-6 hover:border-primary transition-all duration-300 hover:glow-primary"
          >
            <Users className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold mb-2">Drivers</h2>
            <p className="text-gray-400">Meet the racing family</p>
          </Link>

          <Link
            href="/races"
            className="group relative bg-background-secondary border border-gray-800 rounded-lg p-6 hover:border-primary transition-all duration-300 hover:glow-primary"
          >
            <Calendar className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold mb-2">Races</h2>
            <p className="text-gray-400">View race history</p>
          </Link>

          <Link
            href="/scoreboard"
            className="group relative bg-background-secondary border border-gray-800 rounded-lg p-6 hover:border-primary transition-all duration-300 hover:glow-primary"
          >
            <Trophy className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold mb-2">Scoreboard</h2>
            <p className="text-gray-400">See the champions</p>
          </Link>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors duration-200"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}

