import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLapTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return minutes > 0 ? `${minutes}:${secs.padStart(6, '0')}` : `${secs}s`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDateTimeShort(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Convert ISO string to datetime-local input format
export function toDateTimeLocal(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
}

// Get current datetime in local format for default values
export function getCurrentDateTimeLocal(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

export const POINTS_SYSTEM = [10, 8, 6, 4, 2, 1];

export function getPointsForPosition(position: number): number {
  if (position < 1 || position > POINTS_SYSTEM.length) return 0;
  return POINTS_SYSTEM[position - 1];
}

