/**
 * Weather service using Open-Meteo API
 * Provides both historical weather data and forecasts
 * FREE - No API key required, unlimited requests, historical data back to 1940!
 */

export type WeatherData = {
  temp: number; // Temperature in Celsius
  condition: string; // Main condition (Clear, Clouds, Rain, etc.)
  description: string; // Detailed description
  icon: string; // Icon code (WMO weather code)
  humidity: number; // Humidity percentage
  windSpeed: number; // Wind speed in m/s
};

/**
 * Fetch weather data for a specific date using Open-Meteo API
 * Handles both historical data (back to 1940) and forecasts (up to 16 days)
 */
export async function fetchWeatherForDate(
  lat: number,
  lon: number,
  date: Date
): Promise<WeatherData | null> {
  try {
    const now = new Date();
    const targetDate = new Date(date);
    
    // Format date as YYYY-MM-DD
    const dateStr = targetDate.toISOString().split('T')[0];
    
    // Check if it's historical, current, or forecast
    const daysDiff = Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let url: string;
    
    if (daysDiff < -1) {
      // Historical data (past races)
      url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateStr}&end_date=${dateStr}&daily=weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,wind_speed_10m_max&timezone=auto`;
    } else {
      // Current or future data (forecast)
      url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,wind_speed_10m_max&timezone=auto&forecast_days=16`;
    }
    
    const response = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.daily) {
      return null;
    }
    
    // Find the index for our target date
    let index = 0;
    if (daysDiff >= -1) {
      // For forecast, find the matching date
      index = data.daily.time.findIndex((t: string) => t === dateStr);
      if (index === -1) index = 0; // Default to first day if not found
    }
    
    const weatherCode = data.daily.weather_code[index];
    const tempMax = data.daily.temperature_2m_max[index];
    const tempMin = data.daily.temperature_2m_min[index];
    const humidity = data.daily.relative_humidity_2m_mean[index];
    const windSpeed = data.daily.wind_speed_10m_max[index];
    
    // Average temperature
    const temp = Math.round(((tempMax + tempMin) / 2) * 10) / 10;
    
    // Convert WMO weather code to description
    const weatherInfo = getWeatherFromWMOCode(weatherCode);
    
    return {
      temp,
      condition: weatherInfo.condition,
      description: weatherInfo.description,
      icon: weatherInfo.icon,
      humidity: Math.round(humidity),
      windSpeed: Math.round(windSpeed * 10) / 10,
    };
  } catch (error) {
    console.error('Error fetching weather data from Open-Meteo:', error);
    return null;
  }
}

/**
 * Convert WMO Weather Code to human-readable condition
 * WMO Code standard used by Open-Meteo
 * See: https://open-meteo.com/en/docs
 */
function getWeatherFromWMOCode(code: number): { condition: string; description: string; icon: string } {
  const wmoMap: Record<number, { condition: string; description: string; icon: string }> = {
    0: { condition: 'Clear', description: 'Clear sky', icon: '01d' },
    1: { condition: 'Clear', description: 'Mainly clear', icon: '01d' },
    2: { condition: 'Clouds', description: 'Partly cloudy', icon: '02d' },
    3: { condition: 'Clouds', description: 'Overcast', icon: '03d' },
    45: { condition: 'Fog', description: 'Fog', icon: '50d' },
    48: { condition: 'Fog', description: 'Depositing rime fog', icon: '50d' },
    51: { condition: 'Drizzle', description: 'Light drizzle', icon: '09d' },
    53: { condition: 'Drizzle', description: 'Moderate drizzle', icon: '09d' },
    55: { condition: 'Drizzle', description: 'Dense drizzle', icon: '09d' },
    56: { condition: 'Drizzle', description: 'Light freezing drizzle', icon: '09d' },
    57: { condition: 'Drizzle', description: 'Dense freezing drizzle', icon: '09d' },
    61: { condition: 'Rain', description: 'Slight rain', icon: '10d' },
    63: { condition: 'Rain', description: 'Moderate rain', icon: '10d' },
    65: { condition: 'Rain', description: 'Heavy rain', icon: '10d' },
    66: { condition: 'Rain', description: 'Light freezing rain', icon: '13d' },
    67: { condition: 'Rain', description: 'Heavy freezing rain', icon: '13d' },
    71: { condition: 'Snow', description: 'Slight snow fall', icon: '13d' },
    73: { condition: 'Snow', description: 'Moderate snow fall', icon: '13d' },
    75: { condition: 'Snow', description: 'Heavy snow fall', icon: '13d' },
    77: { condition: 'Snow', description: 'Snow grains', icon: '13d' },
    80: { condition: 'Rain', description: 'Slight rain showers', icon: '09d' },
    81: { condition: 'Rain', description: 'Moderate rain showers', icon: '09d' },
    82: { condition: 'Rain', description: 'Violent rain showers', icon: '09d' },
    85: { condition: 'Snow', description: 'Slight snow showers', icon: '13d' },
    86: { condition: 'Snow', description: 'Heavy snow showers', icon: '13d' },
    95: { condition: 'Thunderstorm', description: 'Thunderstorm', icon: '11d' },
    96: { condition: 'Thunderstorm', description: 'Thunderstorm with slight hail', icon: '11d' },
    99: { condition: 'Thunderstorm', description: 'Thunderstorm with heavy hail', icon: '11d' },
  };

  return wmoMap[code] || { condition: 'Unknown', description: 'Unknown conditions', icon: '01d' };
}

/**
 * Get weather icon URL
 * Using a simple icon mapping based on weather condition codes
 */
export function getWeatherIconUrl(iconCode: string): string {
  // Map to OpenWeatherMap-style icons for consistent UI
  // Open-Meteo uses similar icon codes
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

/**
 * Get weather emoji based on condition
 */
export function getWeatherEmoji(condition: string): string {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('clear')) return '☀️';
  if (conditionLower.includes('cloud')) return '☁️';
  if (conditionLower.includes('rain')) return '🌧️';
  if (conditionLower.includes('drizzle')) return '🌦️';
  if (conditionLower.includes('thunder')) return '⛈️';
  if (conditionLower.includes('snow')) return '🌨️';
  if (conditionLower.includes('mist') || conditionLower.includes('fog')) return '🌫️';
  
  return '🌤️';
}

