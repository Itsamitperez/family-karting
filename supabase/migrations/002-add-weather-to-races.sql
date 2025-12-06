-- Add weather-related columns to races table
ALTER TABLE races
  ADD COLUMN weather_temp NUMERIC,
  ADD COLUMN weather_condition TEXT,
  ADD COLUMN weather_description TEXT,
  ADD COLUMN weather_icon TEXT,
  ADD COLUMN weather_humidity INTEGER,
  ADD COLUMN weather_wind_speed NUMERIC,
  ADD COLUMN weather_fetched_at TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the weather fields
COMMENT ON COLUMN races.weather_temp IS 'Temperature in Celsius at race time';
COMMENT ON COLUMN races.weather_condition IS 'Main weather condition (e.g., Clear, Clouds, Rain)';
COMMENT ON COLUMN races.weather_description IS 'Detailed weather description';
COMMENT ON COLUMN races.weather_icon IS 'Weather icon code from API';
COMMENT ON COLUMN races.weather_humidity IS 'Humidity percentage';
COMMENT ON COLUMN races.weather_wind_speed IS 'Wind speed in m/s';
COMMENT ON COLUMN races.weather_fetched_at IS 'Timestamp when weather data was fetched';

