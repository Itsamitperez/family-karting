import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OperatingHours } from '@/types/database';
import tzlookup from 'tz-lookup';

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
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
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
 * Get current time in a specific timezone based on GPS coordinates
 */
function getLocalTime(lat: number, lon: number): { date: Date; dayIndex: number; hours: number; minutes: number } {
  try {
    // Get timezone from coordinates using tz-lookup
    const timezone = tzlookup(lat, lon) || 'UTC';
    
    // Get current time in that timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      weekday: 'short'
    });
    
    const parts = formatter.formatToParts(new Date());
    const getValue = (type: string) => parts.find(p => p.type === type)?.value || '0';
    
    const year = parseInt(getValue('year'));
    const month = parseInt(getValue('month')) - 1; // JS months are 0-indexed
    const day = parseInt(getValue('day'));
    const hours = parseInt(getValue('hour'));
    const minutes = parseInt(getValue('minute'));
    const seconds = parseInt(getValue('second'));
    const weekday = getValue('weekday');
    
    // Convert weekday to day index (0 = Sunday)
    const dayMap: Record<string, number> = {
      'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
    };
    const dayIndex = dayMap[weekday] || 0;
    
    const localDate = new Date(year, month, day, hours, minutes, seconds);
    
    return { date: localDate, dayIndex, hours, minutes };
  } catch (error) {
    // Silently fallback to server time (no console.error to avoid log spam)
    const now = new Date();
    return {
      date: now,
      dayIndex: now.getDay(),
      hours: now.getHours(),
      minutes: now.getMinutes()
    };
  }
}

/**
 * Check if a circuit is currently open based on operating hours
 * Uses circuit's local timezone from GPS coordinates
 */
export function isCircuitOpen(
  operatingHours: OperatingHours | null,
  lat: number | null,
  lon: number | null
): boolean {
  if (!operatingHours || !lat || !lon) return false;

  const { dayIndex, hours, minutes } = getLocalTime(lat, lon);
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const currentDay = dayNames[dayIndex];
  
  const todayHours = operatingHours[currentDay];
  
  if (!todayHours || !todayHours.isOpen) return false;

  // Parse current time in minutes
  const currentMinutes = hours * 60 + minutes;
  
  // Parse open and close times
  const [openHour, openMin] = todayHours.openTime.split(':').map(Number);
  const [closeHour, closeMin] = todayHours.closeTime.split(':').map(Number);
  
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;
  
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

/**
 * Get formatted operating hours for current day in circuit's local timezone
 */
export function getTodayOperatingHours(
  operatingHours: OperatingHours | null,
  lat: number | null,
  lon: number | null
): string {
  if (!operatingHours) return 'Hours not set';
  if (!lat || !lon) return 'Location not set';

  const { dayIndex } = getLocalTime(lat, lon);
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const currentDay = dayNames[dayIndex];
  
  const todayHours = operatingHours[currentDay];
  
  if (!todayHours || !todayHours.isOpen) return 'Closed today';

  return `${todayHours.openTime} - ${todayHours.closeTime}`;
}

