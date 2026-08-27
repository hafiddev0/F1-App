/**
 * Pure data transforms turning raw OpenF1 payloads into view-ready models.
 * No framework, no side effects — trivially unit-testable.
 */

import { formatGap, formatInterval } from "./format";
import type {
  OpenF1CarData,
  OpenF1Driver,
  OpenF1Interval,
  OpenF1Lap,
  OpenF1Position,
  OpenF1Stint,
  TelemetryPoint,
  TimingRow,
} from "./types";

export function findLatest<T extends { date: string }>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items.reduce((latest, item) =>
    new Date(item.date) > new Date(latest.date) ? item : latest,
  );
}

export function findLatestByStart<T extends { date_start: string }>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items.reduce((latest, item) =>
    new Date(item.date_start) > new Date(latest.date_start) ? item : latest,
  );
}

/**
 * Merge positions, drivers, intervals, laps and stints into one sorted
 * timing tower. The position stream contains many updates per driver, so only
 * the most recent record per driver is kept.
 */
export function buildTimingRows(
  positions: OpenF1Position[],
  drivers: OpenF1Driver[],
  intervals: OpenF1Interval[],
  laps: OpenF1Lap[],
  stints: OpenF1Stint[],
): TimingRow[] {
  const driverMap = new Map(drivers.map((d) => [d.driver_number, d]));
  const intervalMap = new Map(intervals.map((i) => [i.driver_number, i]));
  const latestLapMap = new Map<number, OpenF1Lap>();
  const bestLapMap = new Map<number, number>();

  for (const lap of laps) {
    const current = latestLapMap.get(lap.driver_number);
    if (!current || lap.lap_number > current.lap_number) {
      latestLapMap.set(lap.driver_number, lap);
    }
    if (lap.lap_duration && lap.lap_duration > 0) {
      const best = bestLapMap.get(lap.driver_number);
      if (!best || lap.lap_duration < best) {
        bestLapMap.set(lap.driver_number, lap.lap_duration);
      }
    }
  }

  const stintMap = new Map<number, OpenF1Stint>();
  for (const stint of stints) {
    const current = stintMap.get(stint.driver_number);
    if (!current || stint.stint_number > current.stint_number) {
      stintMap.set(stint.driver_number, stint);
    }
  }

  const latestPositionMap = new Map<number, OpenF1Position>();
  for (const pos of positions) {
    const current = latestPositionMap.get(pos.driver_number);
    if (!current || new Date(pos.date) > new Date(current.date)) {
      latestPositionMap.set(pos.driver_number, pos);
    }
  }

  const rows: TimingRow[] = Array.from(latestPositionMap.values()).map((pos) => {
    const driver = driverMap.get(pos.driver_number);
    const interval = intervalMap.get(pos.driver_number);
    const latestLap = latestLapMap.get(pos.driver_number);
    const bestLap = bestLapMap.get(pos.driver_number);
    const stint = stintMap.get(pos.driver_number);

    return {
      position: pos.position,
      driverNumber: pos.driver_number,
      acronym: driver?.name_acronym ?? String(pos.driver_number),
      fullName: driver?.full_name ?? `Driver ${pos.driver_number}`,
      teamName: driver?.team_name ?? "Unknown",
      teamColour: driver?.team_colour ?? "999999",
      gapToLeader: formatGap(interval?.gap_to_leader, pos.position === 1),
      interval: formatInterval(interval?.interval),
      lastLap: latestLap?.lap_duration,
      bestLap: bestLap,
      tyreCompound: stint?.compound,
      tyreAge: stint?.tyre_age_at_start,
      isPersonalBest: latestLap?.lap_duration != null && latestLap.lap_duration === bestLap,
    };
  });

  return rows.sort((a, b) => a.position - b.position);
}

export function buildTelemetryPoints(carData: OpenF1CarData[]): TelemetryPoint[] {
  return carData.map((point) => ({
    timestamp: point.date,
    speed: point.speed,
    throttle: point.throttle,
    brake: point.brake,
    rpm: point.rpm,
    gear: point.n_gear,
  }));
}

/** Sector durations for the latest lap, in order, with undefined for missing sectors. */
export function getSectorDurations(lap?: OpenF1Lap): Array<number | undefined> {
  return [lap?.duration_sector_1, lap?.duration_sector_2, lap?.duration_sector_3];
}
