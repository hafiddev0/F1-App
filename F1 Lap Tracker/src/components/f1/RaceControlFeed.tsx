import { Skeleton } from "@/components/ui/skeleton";
import type { OpenF1RaceControlMessage } from "@/lib/f1-types";
import { formatClockTime, getRaceControlColorClass } from "@/lib/f1-helpers";

interface RaceControlFeedProps {
  messages: OpenF1RaceControlMessage[];
  isLoading?: boolean;
}

export function RaceControlFeed({ messages, isLoading }: RaceControlFeedProps) {
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col p-4 gap-4">
        <Skeleton className="h-3 w-40" />
        <div className="flex-1 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const sorted = [...messages].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="flex flex-1 flex-col p-4 gap-4 overflow-hidden">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Race Control Messages
      </h2>
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 font-mono text-[11px]">
        {sorted.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">NO MESSAGES</div>
        )}
        {sorted.map((msg, index) => (
          <div
            key={`${msg.date}-${index}`}
            className="flex gap-4 items-start py-1 border-b border-border/50"
          >
            <span className="text-muted-foreground shrink-0">{formatClockTime(msg.date)}</span>
            <span className={getRaceControlColorClass(msg.category, msg.flag)}>{msg.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
