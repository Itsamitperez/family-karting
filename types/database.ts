export type Circuit = {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  length: number | null;
  url: string | null;
  type: 'outdoor' | 'indoor';
  location_lat: number | null;
  location_long: number | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

export type Driver = {
  id: string;
  name: string;
  birthday: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Race = {
  id: string;
  race_date: string;
  status: 'done' | 'scheduled' | 'planned';
  race_type: 'race' | 'testing';
  circuit_id: string;
  description: string | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Lap = {
  id: string;
  race_id: string;
  driver_id: string;
  lap_time: number;
  created_at: string;
  updated_at: string;
};

export type RaceDriver = {
  race_id: string;
  driver_id: string;
  position: number | null;
  points: number | null;
};

export type CircuitWithStats = Circuit & {
  best_lap: { lap_time: number; driver_name: string; driver_id: string } | null;
  races_count: number;
};

export type DriverWithStats = Driver & {
  races_count: number;
  total_points: number;
};

export type RaceWithDetails = Race & {
  circuit: Circuit;
  drivers: (Driver & { position: number | null; points: number | null; best_lap: number | null })[];
};

export type ScoreboardEntry = {
  driver_id: string;
  driver_name: string;
  total_points: number;
  races_count: number;
  wins: number;
};

