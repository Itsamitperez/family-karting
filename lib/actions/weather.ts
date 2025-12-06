'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { fetchWeatherForDate } from '@/lib/weather';
import { revalidatePath } from 'next/cache';

/**
 * Fetch and store weather data for a race
 * Uses the circuit's location and race date
 */
export async function fetchRaceWeather(raceId: string) {
  const supabase = await createServerSupabase();

  // Get race with circuit data
  const { data: race, error: raceError } = await supabase
    .from('races')
    .select('*, circuits(location_lat, location_long)')
    .eq('id', raceId)
    .single();

  if (raceError || !race) {
    return { error: 'Race not found' };
  }

  // Check if circuit has location data
  if (!race.circuits?.location_lat || !race.circuits?.location_long) {
    return { error: 'Circuit does not have location coordinates set' };
  }

  // Fetch weather data
  const weatherData = await fetchWeatherForDate(
    Number(race.circuits.location_lat),
    Number(race.circuits.location_long),
    new Date(race.race_date)
  );

  if (!weatherData) {
    return { error: 'Failed to fetch weather data from Open-Meteo. Please check your internet connection and try again.' };
  }

  // Store weather data in the database
  const { error: updateError } = await supabase
    .from('races')
    .update({
      weather_temp: weatherData.temp,
      weather_condition: weatherData.condition,
      weather_description: weatherData.description,
      weather_icon: weatherData.icon,
      weather_humidity: weatherData.humidity,
      weather_wind_speed: weatherData.windSpeed,
      weather_fetched_at: new Date().toISOString(),
    })
    .eq('id', raceId);

  if (updateError) {
    return { error: updateError.message };
  }

  // Revalidate relevant paths
  revalidatePath(`/races/${raceId}`);
  revalidatePath(`/admin/races/${raceId}/edit`);
  revalidatePath('/races');

  return { 
    success: true,
    weather: weatherData,
  };
}

/**
 * Clear weather data for a race
 */
export async function clearRaceWeather(raceId: string) {
  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from('races')
    .update({
      weather_temp: null,
      weather_condition: null,
      weather_description: null,
      weather_icon: null,
      weather_humidity: null,
      weather_wind_speed: null,
      weather_fetched_at: null,
    })
    .eq('id', raceId);

  if (error) {
    return { error: error.message };
  }

  // Revalidate relevant paths
  revalidatePath(`/races/${raceId}`);
  revalidatePath(`/admin/races/${raceId}/edit`);
  revalidatePath('/races');

  return { success: true };
}

/**
 * Fetch current weather for a circuit location
 */
export async function fetchCurrentWeather(lat: number, lon: number) {
  try {
    const weatherData = await fetchWeatherForDate(lat, lon, new Date());
    return weatherData;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    return null;
  }
}

