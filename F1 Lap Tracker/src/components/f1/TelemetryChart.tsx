import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { TelemetryPoint } from "@/lib/f1-types";

interface TelemetryChartProps {
  driverName: string;
  points: TelemetryPoint[];
  isLoading?: boolean;
}

export function TelemetryChart({ driverName, points, isLoading }: TelemetryChartProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col p-4 gap-4 h-full">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="flex-1 w-full" />
      </div>
    );
  }

  const hasData = points.length > 0;
  // Keep the most recent telemetry points so the trace stays readable.
  const visiblePoints = points.slice(-250);

  return (
    <div className="flex flex-col p-4 gap-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Telemetry Trace: {driverName} <span className="text-muted-foreground/50 ml-2">LIVE</span>
        </h2>
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground/70">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-4 bg-race-green rounded-full" />
            SPD
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-4 bg-race-yellow rounded-full" />
            THR
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-4 bg-race-red rounded-full" />
            BRK
          </span>
        </div>
      </div>

      <div className="flex-1 relative bg-card ring-1 ring-black/5 rounded overflow-hidden">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visiblePoints} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="timestamp" hide type="category" />
              <YAxis
                yAxisId="speed"
                orientation="left"
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
                tickFormatter={(v) => `${v}`}
              />
              <YAxis
                yAxisId="percent"
                orientation="right"
                domain={[0, 100]}
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
                hide
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0.02 260)",
                  border: "1px solid oklch(0.20 0.02 260)",
                  borderRadius: "4px",
                  fontSize: "11px",
                }}
                itemStyle={{ color: "oklch(0.95 0 0)" }}
                labelStyle={{ display: "none" }}
              />
              <Line
                yAxisId="speed"
                type="monotone"
                dataKey="speed"
                stroke="oklch(0.65 0.22 145)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                yAxisId="percent"
                type="monotone"
                dataKey="throttle"
                stroke="oklch(0.70 0.18 95)"
                strokeWidth={1}
                strokeOpacity={0.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                yAxisId="percent"
                type="monotone"
                dataKey="brake"
                stroke="oklch(0.60 0.22 25)"
                strokeWidth={1}
                strokeOpacity={0.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/50">
              Telemetry Stream Inactive
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
