/**
 * Formatting + presentation helpers — framework-agnostic.
 * Colors are returned as hex strings so any UI framework can consume them.
 */

import type { OpenF1Session, OpenF1Weather, TyreCompound } from "./types";

/** 92.345 -> "1:32.345"; 58.2 -> "58.200"; missing -> "—". */
export function formatLapTime(seconds?: number): string {
  if (seconds == null || seconds <= 0) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) return `${mins}:${secs.toFixed(3).padStart(6, "0")}`;
  return secs.toFixed(3);
}

function formatNumber(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return String(value);
  return Number(num.toFixed(3)).toString();
}

/** Gap to the leader. The leader itself shows the "INTERVAL" column header value. */
export function formatGap(value?: string | number | null, isLeader = false): string {
  if (isLeader) return "INTERVAL";
  if (value == null || value === "") return "—";
  const text = formatNumber(value);
  if (text === "0" || text === "0.000") return "—";
  return text.startsWith("+") ? text : `+${text}`;
}

/** Gap to the car ahead. */
export function formatInterval(value?: string | number | null): string {
  if (value == null || value === "") return "—";
  const text = formatNumber(value);
  if (text === "0" || text === "0.000") return "—";
  return text.startsWith("+") ? text : `+${text}`;
}

export const TEAM_COLORS: Record<string, string> = {
  "red bull": "#3671C6",
  mercedes: "#27F4D2",
  ferrari: "#E8002D",
  mclaren: "#FF8000",
  aston: "#229971",
  alpine: "#00A1E8",
  haas: "#B6BABD",
  "racing bulls": "#6692FF",
  williams: "#1868DB",
  sauber: "#52E252",
};

/** Hex brand color for a team name as reported by OpenF1. */
export function getTeamColor(teamName: string): string {
  const normalized = teamName.toLowerCase();
  for (const [key, color] of Object.entries(TEAM_COLORS)) {
    if (normalized.includes(key)) return color;
  }
  if (normalized.includes("kick")) return TEAM_COLORS["sauber"]!;
  return "#9CA3AF";
}

export function normalizeCompound(compound?: string): TyreCompound {
  const c = compound?.toLowerCase() ?? "";
  if (c.includes("soft")) return "SOFT";
  if (c.includes("medium")) return "MEDIUM";
  if (c.includes("hard")) return "HARD";
  if (c.includes("intermediate")) return "INTERMEDIATE";
  if (c.includes("wet")) return "WET";
  return "UNKNOWN";
}

/** Single-letter tyre marker: S / M / H / I / W / ?. */
export function getCompoundInitial(compound?: string): string {
  const normalized = normalizeCompound(compound);
  return normalized === "UNKNOWN" ? "?" : normalized.charAt(0);
}

export const COMPOUND_COLORS: Record<TyreCompound, string> = {
  SOFT: "#EF4444",
  MEDIUM: "#EAB308",
  HARD: "#F5F5F5",
  INTERMEDIATE: "#22C55E",
  WET: "#3671C6",
  UNKNOWN: "#9CA3AF",
};

export function getCompoundColor(compound?: string): string {
  return COMPOUND_COLORS[normalizeCompound(compound)];
}

/** "RACE • ZANDVOORT" */
export function getSessionDisplayName(session: OpenF1Session): string {
  const name = session.session_name || session.session_type || "Session";
  const circuit = session.circuit_short_name || session.location || "Unknown Circuit";
  return `${name.toUpperCase()} • ${circuit.toUpperCase()}`;
}

export function getTrackStatusMessage(weather?: OpenF1Weather): string {
  if (!weather) return "TRACK CLEAR";
  if (weather.rainfall > 0) return "WET TRACK";
  return "TRACK CLEAR";
}

/** Race-control message severity, for coloring the feed. */
export type RaceControlSeverity = "yellow" | "red" | "green" | "chequered" | "info";

export function getRaceControlSeverity(
  category: string,
  flag: string | null,
): RaceControlSeverity {
  const lower = category.toLowerCase();
  const flagLower = flag?.toLowerCase() ?? "";
  if (flagLower.includes("yellow") || lower.includes("yellow")) return "yellow";
  if (flagLower.includes("red") || lower.includes("red")) return "red";
  if (flagLower.includes("green") || lower.includes("green")) return "green";
  if (lower.includes("safety") || lower.includes("virtual")) return "yellow";
  if (lower.includes("chequered")) return "chequered";
  return "info";
}

/** 24h clock time from an ISO timestamp, e.g. "15:28:48". */
export function formatClockTime(dateString: string, locale = "en-GB"): string {
  return new Date(dateString).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
