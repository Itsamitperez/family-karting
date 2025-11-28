-- Run this SQL in your Supabase SQL Editor to add write policies for authenticated users
-- This allows logged-in users to create, update, and delete data

-- Circuits write policies
CREATE POLICY "Authenticated users can insert circuits" ON circuits
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update circuits" ON circuits
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete circuits" ON circuits
  FOR DELETE TO authenticated USING (true);

-- Drivers write policies
CREATE POLICY "Authenticated users can insert drivers" ON drivers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update drivers" ON drivers
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete drivers" ON drivers
  FOR DELETE TO authenticated USING (true);

-- Races write policies
CREATE POLICY "Authenticated users can insert races" ON races
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update races" ON races
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete races" ON races
  FOR DELETE TO authenticated USING (true);

-- Laps write policies
CREATE POLICY "Authenticated users can insert laps" ON laps
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update laps" ON laps
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete laps" ON laps
  FOR DELETE TO authenticated USING (true);

-- Race_drivers write policies
CREATE POLICY "Authenticated users can insert race_drivers" ON race_drivers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update race_drivers" ON race_drivers
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete race_drivers" ON race_drivers
  FOR DELETE TO authenticated USING (true);

