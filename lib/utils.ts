import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OperatingHours } from '@/types/database';

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

// Default placeholder images
export const DEFAULT_DRIVER_IMAGE = 'https://minpscbyyaqnfzrigfvl.supabase.co/storage/v1/object/public/images/drivers/1764411388253-xzc1r.png';

/**
 * Check if a circuit is currently open based on operating hours
 */
export function isCircuitOpen(operatingHours: OperatingHours | null): boolean {
  if (!operatingHours) return false;

  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const currentDay = dayNames[now.getDay()];
  
  const todayHours = operatingHours[currentDay];
  
  if (!todayHours || !todayHours.isOpen) return false;

  // Parse current time
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  // Parse open and close times
  const [openHour, openMin] = todayHours.openTime.split(':').map(Number);
  const [closeHour, closeMin] = todayHours.closeTime.split(':').map(Number);
  
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;
  
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

/**
 * Get formatted operating hours for current day
 */
export function getTodayOperatingHours(operatingHours: OperatingHours | null): string {
  if (!operatingHours) return 'Hours not set';

  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const currentDay = dayNames[now.getDay()];
  
  const todayHours = operatingHours[currentDay];
  
  if (!todayHours || !todayHours.isOpen) return 'Closed today';

  return `${todayHours.openTime} - ${todayHours.closeTime}`;
}

