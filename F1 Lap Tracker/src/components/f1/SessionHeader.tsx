import { Activity } from "lucide-react";
import type { OpenF1Session, OpenF1Weather } from "@/lib/f1-types";
import { getSessionDisplayName, getTrackStatusMessage } from "@/lib/f1-helpers";

interface SessionHeaderProps {
  session: OpenF1Session | null;
  weather: OpenF1Weather | null;
  lap?: number | undefined;
  totalLaps?: number | undefined;
}

export function SessionHeader({ session, weather, lap, totalLaps }: SessionHeaderProps) {
  const status = getTrackStatusMessage(weather ?? undefined);
  const isWet = weather?.rainfall && weather.rainfall > 0;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 bg-race-red" />
          <h1 className="text-sm font-medium tracking-tight text-card-foreground text-balance">
            {session ? getSessionDisplayName(session) : "OPENF1 DASHBOARD"}
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono tracking-wider text-muted-foreground">
          <span className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full animate-pulse ${isWet ? "bg-race-yellow" : "bg-race-green"}`}
            />
            {status}
          </span>
          <span>
            LAP {lap ?? "—"} / {totalLaps ?? "—"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-8 items-center bg-card ring-1 ring-black/5 px-3 rounded gap-4">
          <div className="text-[10px] font-mono">
            <span className="text-muted-foreground">AIR</span>{" "}
            <span className="text-card-foreground">
              {weather ? `${weather.air_temperature.toFixed(1)}°C` : "—"}
            </span>
          </div>
          <div className="text-[10px] font-mono">
            <span className="text-muted-foreground">TRACK</span>{" "}
            <span className="text-card-foreground">
              {weather ? `${weather.track_temperature.toFixed(1)}°C` : "—"}
            </span>
          </div>
          <div className="text-[10px] font-mono">
            <span className="text-muted-foreground">HUMIDITY</span>{" "}
            <span className="text-card-foreground">
              {weather ? `${weather.humidity.toFixed(0)}%` : "—"}
            </span>
          </div>
        </div>
        <button className="flex h-8 items-center bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium pl-2 pr-3 py-2 rounded ring-1 ring-border transition-colors">
          <Activity className="mr-2 h-4 w-4 opacity-50" />
          LIVE VIEW
        </button>
      </div>
    </header>
  );
}
