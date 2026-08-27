import { Skeleton } from "@/components/ui/skeleton";
import type { TimingRow } from "@/lib/f1-types";
import {
  formatLapTime,
  getCompoundColorClass,
  getCompoundInitial,
  getTeamColorClass,
} from "@/lib/f1-helpers";

interface TimingTowerProps {
  rows: TimingRow[];
  selectedDriver?: number | undefined;
  onSelectDriver?: (driverNumber: number) => void;
  isLoading?: boolean | undefined;
}

export function TimingTower({
  rows,
  selectedDriver,
  onSelectDriver,
  isLoading,
}: TimingTowerProps) {
  if (isLoading) {
    return (
      <aside className="w-[420px] shrink-0 border-r border-border bg-background/50 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex-1 space-y-2 p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[420px] shrink-0 border-r border-border bg-background/50 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col">
      <div className="sticky top-0 z-10 grid grid-cols-[32px_4px_64px_1fr_64px_48px] items-center border-b border-border bg-background px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>POS</span>
        <span />
        <span>DRIVER</span>
        <span>GAP/INT</span>
        <span>LAST</span>
        <span className="text-right">TYRE</span>
      </div>

      <div className="divide-y divide-border/50">
        {rows.length === 0 && (
          <div className="p-8 text-center text-xs text-muted-foreground font-mono">
            NO TIMING DATA AVAILABLE
          </div>
        )}
        {rows.map((row) => {
          const compoundClass = getCompoundColorClass(row.tyreCompound);
          const isSelected = selectedDriver === row.driverNumber;
          return (
            <button
              key={row.driverNumber}
              onClick={() => onSelectDriver?.(row.driverNumber)}
              className={`w-full grid grid-cols-[32px_4px_64px_1fr_64px_48px] items-center px-2 py-2.5 font-mono text-xs text-left transition-colors ${
                isSelected ? "bg-primary/10" : "hover:bg-card/60 bg-card/20"
              }`}
            >
              <span className="font-medium text-card-foreground">{row.position}</span>
              <div className={`h-full w-full ${getTeamColorClass(row.teamName)}`} />
              <span className="pl-2 font-semibold text-card-foreground">{row.acronym}</span>
              <div className="flex flex-col gap-0.5 px-2">
                <span className="text-muted-foreground">{row.gapToLeader}</span>
                {row.gapToLeader !== "INTERVAL" && (
                  <span className="text-[10px] text-muted-foreground/70">{row.interval}</span>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span className={row.isPersonalBest ? "text-race-purple" : "text-foreground/80"}>
                  {formatLapTime(row.lastLap)}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {row.bestLap ? formatLapTime(row.bestLap) : "—"}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div
                  className={`h-3 w-3 rounded-full border flex items-center justify-center text-[8px] ${compoundClass}`}
                >
                  {getCompoundInitial(row.tyreCompound)}
                </div>
                <span className="text-[9px] text-muted-foreground">
                  {row.tyreAge != null ? `${row.tyreAge} L` : "—"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
