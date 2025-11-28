-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE circuit_type AS ENUM ('outdoor', 'indoor');
CREATE TYPE circuit_status AS ENUM ('active', 'inactive');
CREATE TYPE race_status AS ENUM ('done', 'scheduled', 'planned');

-- Create circuits table
CREATE TABLE circuits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  length NUMERIC,
  url TEXT,
  type circuit_type NOT NULL,
  location_lat NUMERIC,
  location_long NUMERIC,
  status circuit_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drivers table
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  birthday DATE,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create races table
CREATE TABLE races (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  race_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status race_status NOT NULL DEFAULT 'planned',
  circuit_id UUID NOT NULL REFERENCES circuits(id) ON DELETE CASCADE,
  description TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create laps table
CREATE TABLE laps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  lap_time NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create race_drivers junction table (for race results)
CREATE TABLE race_drivers (
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  position INTEGER,
  points INTEGER,
  PRIMARY KEY (race_id, driver_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_races_circuit_id ON races(circuit_id);
CREATE INDEX idx_races_date ON races(race_date);
CREATE INDEX idx_laps_race_id ON laps(race_id);
CREATE INDEX idx_laps_driver_id ON laps(driver_id);
CREATE INDEX idx_laps_lap_time ON laps(lap_time);
CREATE INDEX idx_race_drivers_race_id ON race_drivers(race_id);
CREATE INDEX idx_race_drivers_driver_id ON race_drivers(driver_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_circuits_updated_at BEFORE UPDATE ON circuits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_races_updated_at BEFORE UPDATE ON races
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_laps_updated_at BEFORE UPDATE ON laps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE laps ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_drivers ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (all tables are publicly readable)
CREATE POLICY "Public read access for circuits" ON circuits
  FOR SELECT USING (true);

CREATE POLICY "Public read access for drivers" ON drivers
  FOR SELECT USING (true);

CREATE POLICY "Public read access for races" ON races
  FOR SELECT USING (true);

CREATE POLICY "Public read access for laps" ON laps
  FOR SELECT USING (true);

CREATE POLICY "Public read access for race_drivers" ON race_drivers
  FOR SELECT USING (true);

-- Write policies for authenticated users (admin access)
-- Circuits
CREATE POLICY "Authenticated users can insert circuits" ON circuits
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update circuits" ON circuits
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete circuits" ON circuits
  FOR DELETE TO authenticated USING (true);

-- Drivers
CREATE POLICY "Authenticated users can insert drivers" ON drivers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update drivers" ON drivers
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete drivers" ON drivers
  FOR DELETE TO authenticated USING (true);

-- Races
CREATE POLICY "Authenticated users can insert races" ON races
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update races" ON races
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete races" ON races
  FOR DELETE TO authenticated USING (true);

-- Laps
CREATE POLICY "Authenticated users can insert laps" ON laps
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update laps" ON laps
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete laps" ON laps
  FOR DELETE TO authenticated USING (true);

-- Race_drivers
CREATE POLICY "Authenticated users can insert race_drivers" ON race_drivers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update race_drivers" ON race_drivers
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete race_drivers" ON race_drivers
  FOR DELETE TO authenticated USING (true);

