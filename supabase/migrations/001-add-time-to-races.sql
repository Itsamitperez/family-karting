-- Migration: Change races.date from DATE to TIMESTAMP WITH TIME ZONE
-- Run this if you already have the database set up with the old schema

-- Step 1: Add new column
ALTER TABLE races ADD COLUMN race_date TIMESTAMP WITH TIME ZONE;

-- Step 2: Copy data from old column (assuming midnight time)
UPDATE races SET race_date = date::timestamp with time zone;

-- Step 3: Make the new column NOT NULL
ALTER TABLE races ALTER COLUMN race_date SET NOT NULL;

-- Step 4: Drop the old column
ALTER TABLE races DROP COLUMN date;

-- Step 5: Update the index
DROP INDEX IF EXISTS idx_races_date;
CREATE INDEX idx_races_date ON races(race_date);

