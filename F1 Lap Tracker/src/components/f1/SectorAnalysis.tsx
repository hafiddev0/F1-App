import { Skeleton } from "@/components/ui/skeleton";
import type { OpenF1Lap } from "@/lib/f1-types";

interface SectorAnalysisProps {
  latestLap?: OpenF1Lap | undefined;
  speedTrap?: number | undefined;
  isLoading?: boolean | undefined;
}

export function SectorAnalysis({ latestLap, speedTrap, isLoading }: SectorAnalysisProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 divide-x divide-border border-t border-border h-full">
        <Skeleton className="h-full" />
        <Skeleton className="h-full" />
        <Skeleton className="h-full" />
      </div>
    );
  }

  const sectors = [
    latestLap?.duration_sector_1,
    latestLap?.duration_sector_2,
    latestLap?.duration_sector_3,
  ];
  const maxSector = Math.max(...sectors.map((s) => s ?? 0), 0.001);

  return (
    <div className="grid grid-cols-3 divide-x divide-border border-t border-border h-full">
      <div className="flex flex-col p-4">
        <span className="text-[10px] font-medium text-muted-foreground uppercase mb-2">
          Sector Analysis
        </span>
        <div className="flex-1 flex items-end gap-1">
          {sectors.map((sector, i) => {
            const height = sector ? `${(sector / maxSector) * 100}%` : "10%";
            const isBest = sector && sector === Math.min(...sectors.map((s) => s ?? Infinity));
            return (
              <div
                key={i}
                className={`w-full rounded-t-sm ${isBest ? "bg-race-green/40 border-t border-race-green" : "bg-muted"}`}
                style={{ height }}
                title={sector ? `S${i + 1}: ${sector.toFixed(3)}s` : undefined}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-col p-4">
        <span className="text-[10px] font-medium text-muted-foreground uppercase mb-2">
          Speed Trap (ST1)
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-mono font-medium text-card-foreground">
            {speedTrap?.toFixed(1) ?? "—"}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">KM/H</span>
        </div>
        <span className="text-[10px] text-race-green mt-1">LIVE TELEMETRY</span>
      </div>

      <div className="flex flex-col p-4">
        <span className="text-[10px] font-medium text-muted-foreground uppercase mb-2">
          Brake Temp
        </span>
        <div className="flex gap-4 mt-auto">
          <div className="flex-1 bg-muted rounded-sm h-1 overflow-hidden">
            <div
              className="h-full bg-race-red shadow-[0_0_8px_rgba(239,68,68,0.4)]"
              style={{ width: "80%" }}
            />
          </div>
          <div className="flex-1 bg-muted rounded-sm h-1 overflow-hidden">
            <div className="h-full bg-race-red" style={{ width: "75%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
