import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SessionHeader } from "./SessionHeader";
import { TimingTower } from "./TimingTower";
import { TelemetryChart } from "./TelemetryChart";
import { SectorAnalysis } from "./SectorAnalysis";
import { RaceControlFeed } from "./RaceControlFeed";
import {
  getCarData,
  getDrivers,
  getIntervals,
  getLaps,
  getLatestSession,
  getPositions,
  getRaceControlMessages,
  getStints,
  getWeather,
} from "@/lib/openf1.functions";
import { buildTelemetryPoints, buildTimingRows, findLatestByStart } from "@/lib/f1-helpers";

const REFETCH_INTERVAL = 5000;

export function Dashboard() {
  const fetchLatestSession = useServerFn(getLatestSession);
  const fetchDrivers = useServerFn(getDrivers);
  const fetchPositions = useServerFn(getPositions);
  const fetchIntervals = useServerFn(getIntervals);
  const fetchLaps = useServerFn(getLaps);
  const fetchCarData = useServerFn(getCarData);
  const fetchRaceControl = useServerFn(getRaceControlMessages);
  const fetchWeather = useServerFn(getWeather);
  const fetchStints = useServerFn(getStints);

  const {
    data: session,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useQuery({
    queryKey: ["f1", "session"],
    queryFn: fetchLatestSession,
    staleTime: 60_000,
  });

  const sessionKey = session?.session_key;

  const { data: drivers = [], isLoading: isDriversLoading } = useQuery({
    queryKey: ["f1", "drivers", sessionKey],
    queryFn: () => fetchDrivers({ data: { sessionKey: sessionKey! } }),
    enabled: !!sessionKey,
    refetchInterval: REFETCH_INTERVAL,
  });

  const { data: positions = [], isLoading: isPositionsLoading } = useQuery({
    queryKey: ["f1", "positions", sessionKey],
    queryFn: () => fetchPositions({ data: { sessionKey: sessionKey! } }),
    enabled: !!sessionKey,
    refetchInterval: REFETCH_INTERVAL,
  });

  const { data: intervals = [] } = useQuery({
    queryKey: ["f1", "intervals", sessionKey],
    queryFn: () => fetchIntervals({ data: { sessionKey: sessionKey! } }),
    enabled: !!sessionKey,
    refetchInterval: REFETCH_INTERVAL,
  });

  const { data: laps = [] } = useQuery({
    queryKey: ["f1", "laps", sessionKey],
    queryFn: () => fetchLaps({ data: { sessionKey: sessionKey! } }),
    enabled: !!sessionKey,
    refetchInterval: REFETCH_INTERVAL,
  });

  const { data: stints = [] } = useQuery({
    queryKey: ["f1", "stints", sessionKey],
    queryFn: () => fetchStints({ data: { sessionKey: sessionKey! } }),
    enabled: !!sessionKey,
    refetchInterval: REFETCH_INTERVAL,
  });

  const { data: weatherData = [] } = useQuery({
    queryKey: ["f1", "weather", sessionKey],
    queryFn: () => fetchWeather({ data: { sessionKey: sessionKey! } }),
    enabled: !!sessionKey,
    refetchInterval: REFETCH_INTERVAL,
  });

  const { data: raceControl = [] } = useQuery({
    queryKey: ["f1", "raceControl", sessionKey],
    queryFn: () => fetchRaceControl({ data: { sessionKey: sessionKey! } }),
    enabled: !!sessionKey,
    refetchInterval: REFETCH_INTERVAL,
  });

  const timingRows = useMemo(
    () => buildTimingRows(positions, drivers, intervals, laps, stints),
    [positions, drivers, intervals, laps, stints],
  );

  const [selectedDriver, setSelectedDriver] = useState<number | undefined>(() => {
    return timingRows[0]?.driverNumber;
  });

  const effectiveSelected = selectedDriver ?? timingRows[0]?.driverNumber;

  const { data: carData = [] } = useQuery({
    queryKey: ["f1", "carData", sessionKey, effectiveSelected],
    queryFn: () =>
      fetchCarData({ data: { sessionKey: sessionKey!, driverNumber: effectiveSelected! } }),
    enabled: !!sessionKey && !!effectiveSelected,
    refetchInterval: 2000,
  });

  const telemetryPoints = useMemo(() => buildTelemetryPoints(carData), [carData]);
  const latestWeather = findLatestByStart(weatherData.map((w) => ({ ...w, date_start: w.date })));
  const selectedDriverInfo = drivers.find((d) => d.driver_number === effectiveSelected);
  const selectedDriverLaps = laps.filter((l) => l.driver_number === effectiveSelected);
  const latestSelectedLap = findLatestByStart(
    selectedDriverLaps.map((l) => ({ ...l, date_start: l.date_start })),
  );
  const latestSpeedTrap = latestSelectedLap?.i1_speed ?? latestSelectedLap?.i2_speed;

  const isLoading = isSessionLoading || isDriversLoading || isPositionsLoading;

  if (sessionError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground font-mono text-sm">
        Error loading session: {sessionError.message}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground font-sans antialiased selection:bg-muted">
      <SessionHeader
        session={session ?? null}
        weather={latestWeather ?? null}
        lap={latestSelectedLap?.lap_number}
        totalLaps={session ? undefined : undefined}
      />

      <main className="flex flex-1 overflow-hidden">
        <TimingTower
          rows={timingRows}
          selectedDriver={effectiveSelected}
          onSelectDriver={setSelectedDriver}
          isLoading={isLoading}
        />

        <section className="flex flex-1 flex-col overflow-hidden">
          <div className="grid h-1/2 grid-rows-2 border-b border-border">
            <TelemetryChart
              driverName={selectedDriverInfo?.name_acronym ?? "—"}
              points={telemetryPoints}
              isLoading={isLoading}
            />
            <SectorAnalysis
              latestLap={latestSelectedLap}
              speedTrap={latestSpeedTrap}
              isLoading={isLoading}
            />
          </div>

          <RaceControlFeed messages={raceControl} isLoading={isLoading} />
        </section>
      </main>

      <footer className="flex h-8 shrink-0 items-center justify-between border-t border-border bg-background px-4">
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <span>SOURCE: OPENF1 API</span>
          <span>LATENCY: LIVE</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <div className="h-1.5 w-1.5 bg-race-green" />
            <div className="h-1.5 w-1.5 bg-race-green" />
            <div className="h-1.5 w-1.5 bg-muted" />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">ENGINEERING MODE v1.0</span>
        </div>
      </footer>
    </div>
  );
}
