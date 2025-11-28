import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, Calendar, Trophy } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-gray-800 bg-background-secondary">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Family Karting Logo"
              width={32}
              height={32}
              className="text-primary"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Family Karting
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-4">
            <Link
              href="/circuits"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <MapPin size={20} />
              <span className="hidden sm:inline">Circuits</span>
            </Link>
            <Link
              href="/drivers"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Users size={20} />
              <span className="hidden sm:inline">Drivers</span>
            </Link>
            <Link
              href="/races"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Calendar size={20} />
              <span className="hidden sm:inline">Races</span>
            </Link>
            <Link
              href="/scoreboard"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Trophy size={20} />
              <span className="hidden sm:inline">Scoreboard</span>
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

