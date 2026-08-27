// Thin React/Tailwind adapter over the framework-agnostic core in src/f1-core.
// Pure data + formatting logic lives there; only Tailwind class mapping is here.

export {
  buildTelemetryPoints,
  buildTimingRows,
  findLatest,
  findLatestByStart,
  getSectorDurations,
} from "@/f1-core/transforms";

export {
  formatClockTime,
  formatGap,
  formatInterval,
  formatLapTime,
  getCompoundInitial,
  getRaceControlSeverity,
  getSessionDisplayName,
  getTeamColor,
  getTrackStatusMessage,
  normalizeCompound,
} from "@/f1-core/format";

import { getRaceControlSeverity, normalizeCompound } from "@/f1-core/format";
import type { TyreCompound } from "@/f1-core/types";

export function getTeamColorClass(teamName: string): string {
  const normalized = teamName.toLowerCase();
  if (normalized.includes("red bull")) return "bg-team-rb";
  if (normalized.includes("mercedes")) return "bg-team-merc";
  if (normalized.includes("ferrari")) return "bg-team-ferrari";
  if (normalized.includes("mclaren")) return "bg-team-mclaren";
  if (normalized.includes("aston")) return "bg-team-aston";
  if (normalized.includes("alpine")) return "bg-team-alpine";
  if (normalized.includes("haas")) return "bg-team-haas";
  if (normalized.includes("racing bulls") || normalized.includes("rb "))
    return "bg-team-racing-bulls";
  if (normalized.includes("williams")) return "bg-team-williams";
  if (normalized.includes("sauber") || normalized.includes("kick")) return "bg-team-kick";
  return "bg-muted-foreground";
}

const COMPOUND_CLASSES: Record<TyreCompound, string> = {
  SOFT: "text-race-red border-race-red",
  MEDIUM: "text-race-yellow border-race-yellow",
  HARD: "text-foreground border-foreground",
  INTERMEDIATE: "text-race-green border-race-green",
  WET: "text-team-rb border-team-rb",
  UNKNOWN: "text-muted-foreground border-muted-foreground",
};

export function getCompoundColorClass(compound?: string): string {
  return COMPOUND_CLASSES[normalizeCompound(compound)];
}

const SEVERITY_CLASSES: Record<ReturnType<typeof getRaceControlSeverity>, string> = {
  yellow: "text-race-yellow",
  red: "text-race-red",
  green: "text-race-green",
  chequered: "text-race-purple",
  info: "text-foreground/80",
};

export function getRaceControlColorClass(category: string, flag: string | null): string {
  return SEVERITY_CLASSES[getRaceControlSeverity(category, flag)];
}
