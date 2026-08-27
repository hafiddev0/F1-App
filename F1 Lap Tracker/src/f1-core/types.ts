/**
 * OpenF1 API domain types.
 * Framework-agnostic: no React, no Angular, no DOM. Safe to copy as-is.
 */

export interface OpenF1Session {
  session_key: number;
  session_name: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  session_type: string;
  meeting_key: number;
  location: string;
  country_key: number;
  country_code: string;
  circuit_short_name: string;
  year: number;
}

export interface OpenF1Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  country_code: string;
  session_key: number;
  meeting_key: number;
  headshot_url?: string;
}

export interface OpenF1Position {
  date: string;
  driver_number: number;
  meeting_key: number;
  position: number;
  session_key: number;
}

export interface OpenF1Interval {
  date: string;
  driver_number: number;
  gap_to_leader: string | number | null;
  interval: string | number | null;
  meeting_key: number;
  session_key: number;
}

export interface OpenF1Lap {
  date_start: string;
  driver_number: number;
  duration_sector_1?: number;
  duration_sector_2?: number;
  duration_sector_3?: number;
  i1_speed?: number;
  i2_speed?: number;
  lap_duration?: number;
  lap_number: number;
  meeting_key: number;
  segment_1?: number;
  segment_2?: number;
  segment_3?: number;
  segment_4?: number;
  segment_5?: number;
  session_key: number;
  st_speed?: number;
}

export interface OpenF1CarData {
  brake: number;
  date: string;
  driver_number: number;
  drs: number;
  meeting_key: number;
  n_gear: number;
  rpm: number;
  session_key: number;
  speed: number;
  throttle: number;
}

export interface OpenF1RaceControlMessage {
  category: string;
  date: string;
  flag: string | null;
  message: string;
  meeting_key: number;
  scope: string | null;
  sector: number | null;
  session_key: number;
}

export interface OpenF1Weather {
  air_temperature: number;
  date: string;
  humidity: number;
  meeting_key: number;
  pressure: number;
  rainfall: number;
  session_key: number;
  track_temperature: number;
  wind_direction: number;
  wind_speed: number;
}

export interface OpenF1Stint {
  compound: string;
  driver_number: number;
  lap_end: number;
  lap_start: number;
  meeting_key: number;
  session_key: number;
  stint_number: number;
  tyre_age_at_start: number;
}

/** A single row of the live timing tower, ready for rendering. */
export interface TimingRow {
  position: number;
  driverNumber: number;
  acronym: string;
  fullName: string;
  teamName: string;
  teamColour: string;
  gapToLeader: string;
  interval: string;
  lastLap?: number | undefined;
  bestLap?: number | undefined;
  tyreCompound?: string | undefined;
  tyreAge?: number | undefined;
  isPersonalBest?: boolean | undefined;
}

/** A single telemetry sample, ready for charting. */
export interface TelemetryPoint {
  timestamp: string;
  speed: number;
  throttle: number;
  brake: number;
  rpm: number;
  gear: number;
}

export type TeamName =
  | "Red Bull Racing"
  | "Mercedes"
  | "Ferrari"
  | "McLaren"
  | "Aston Martin"
  | "Alpine"
  | "Haas F1 Team"
  | "Racing Bulls"
  | "Williams"
  | "Kick Sauber"
  | string;

export type TyreCompound = "SOFT" | "MEDIUM" | "HARD" | "INTERMEDIATE" | "WET" | "UNKNOWN";
