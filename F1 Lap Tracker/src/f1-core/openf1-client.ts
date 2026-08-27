/**
 * OpenF1 HTTP client — framework-agnostic.
 *
 * Adds per-URL caching, in-flight de-duplication, outbound request spacing and
 * exponential backoff on 429 / 5xx, which OpenF1 needs when several panels poll
 * at once. Uses only `fetch`, so it runs in a browser, in Node, in a worker, or
 * inside an Angular service.
 */

import type {
  OpenF1CarData,
  OpenF1Driver,
  OpenF1Interval,
  OpenF1Lap,
  OpenF1Position,
  OpenF1RaceControlMessage,
  OpenF1Session,
  OpenF1Stint,
  OpenF1Weather,
} from "./types";

export interface OpenF1ClientOptions {
  /** API base URL. Point this at a proxy if you need to avoid browser CORS. */
  baseUrl?: string;
  /** How long a successful response stays cached, in ms. Default 15000. */
  cacheTtlMs?: number;
  /** Minimum delay between two outbound requests, in ms. Default 350. */
  minSpacingMs?: number;
  /** Max attempts per request when the API answers 429 / 5xx. Default 4. */
  maxRetries?: number;
}

export type QueryParams = Record<string, string | number | undefined | null>;

const DEFAULT_BASE_URL = "https://api.openf1.org/v1";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class OpenF1Client {
  private readonly baseUrl: string;
  private readonly cacheTtlMs: number;
  private readonly minSpacingMs: number;
  private readonly maxRetries: number;

  private readonly cache = new Map<string, { expires: number; value: unknown }>();
  private readonly inflight = new Map<string, Promise<unknown>>();
  private chain: Promise<unknown> = Promise.resolve();

  constructor(options: OpenF1ClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.cacheTtlMs = options.cacheTtlMs ?? 15_000;
    this.minSpacingMs = options.minSpacingMs ?? 350;
    this.maxRetries = options.maxRetries ?? 4;
  }

  /** Clear every cached response (e.g. when switching sessions). */
  clearCache(): void {
    this.cache.clear();
  }

  /** Raw typed GET against any OpenF1 endpoint. */
  async get<T>(path: string, params?: QueryParams, ttlMs = this.cacheTtlMs): Promise<T> {
    const key = this.buildUrl(path, params);

    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) return cached.value as T;

    const existing = this.inflight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = this.schedule(() => this.request(key))
      .then((value) => {
        this.cache.set(key, { value, expires: Date.now() + ttlMs });
        return value;
      })
      .catch((error: unknown) => {
        // Serve stale data rather than blanking the UI.
        if (cached) return cached.value;
        throw error;
      })
      .finally(() => {
        this.inflight.delete(key);
      });

    this.inflight.set(key, promise);
    return promise as Promise<T>;
  }

  // ---------------------------------------------------------------- endpoints

  getSessions(params: QueryParams): Promise<OpenF1Session[]> {
    return this.get<OpenF1Session[]>("sessions", params, 60_000);
  }

  async getSessionByKey(sessionKey: number): Promise<OpenF1Session | null> {
    const sessions = await this.getSessions({ session_key: sessionKey });
    return sessions[0] ?? null;
  }

  /**
   * Currently running session, or the most recently started one.
   * Falls back through the two previous seasons when the current one is empty.
   */
  async getLatestSession(now: Date = new Date()): Promise<OpenF1Session | null> {
    const year = now.getUTCFullYear();
    let sessions: OpenF1Session[] = [];
    for (const candidate of [year, year - 1, year - 2]) {
      sessions = await this.getSessions({ year: candidate });
      if (sessions.length > 0) break;
    }
    if (sessions.length === 0) return null;

    const active = sessions.find(
      (s) => new Date(s.date_start) <= now && now <= new Date(s.date_end),
    );
    if (active) return active;

    return (
      sessions
        .filter((s) => new Date(s.date_start) <= now)
        .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())[0] ??
      null
    );
  }

  getDrivers(sessionKey: number): Promise<OpenF1Driver[]> {
    return this.get<OpenF1Driver[]>("drivers", { session_key: sessionKey });
  }

  getPositions(sessionKey: number): Promise<OpenF1Position[]> {
    return this.get<OpenF1Position[]>("position", { session_key: sessionKey });
  }

  getIntervals(sessionKey: number): Promise<OpenF1Interval[]> {
    return this.get<OpenF1Interval[]>("intervals", { session_key: sessionKey });
  }

  getLaps(sessionKey: number): Promise<OpenF1Lap[]> {
    return this.get<OpenF1Lap[]>("laps", { session_key: sessionKey });
  }

  getCarData(sessionKey: number, driverNumber: number): Promise<OpenF1CarData[]> {
    return this.get<OpenF1CarData[]>("car_data", {
      session_key: sessionKey,
      driver_number: driverNumber,
    });
  }

  getRaceControlMessages(sessionKey: number): Promise<OpenF1RaceControlMessage[]> {
    return this.get<OpenF1RaceControlMessage[]>("race_control", { session_key: sessionKey });
  }

  getWeather(sessionKey: number): Promise<OpenF1Weather[]> {
    return this.get<OpenF1Weather[]>("weather", { session_key: sessionKey });
  }

  getStints(sessionKey: number): Promise<OpenF1Stint[]> {
    return this.get<OpenF1Stint[]>("stints", { session_key: sessionKey });
  }

  // ----------------------------------------------------------------- internals

  private buildUrl(path: string, params?: QueryParams): string {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = new URL(cleanPath, `${this.baseUrl}/`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value != null && value !== "") url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  /** Serialize outbound requests so we never burst the API. */
  private schedule<T>(task: () => Promise<T>): Promise<T> {
    const run = this.chain.then(async () => {
      const result = await task();
      await sleep(this.minSpacingMs);
      return result;
    });
    this.chain = run.catch(() => undefined);
    return run as Promise<T>;
  }

  private async request(url: string): Promise<unknown> {
    let lastError: unknown;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (response.ok) return await response.json();

      if (response.status === 429 || response.status >= 500) {
        const retryAfter = Number(response.headers.get("retry-after"));
        const wait =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : 700 * Math.pow(2, attempt);
        lastError = new Error(`OpenF1 API error: ${response.status} ${response.statusText}`);
        await sleep(Math.min(wait, 6000));
        continue;
      }

      throw new Error(`OpenF1 API error: ${response.status} ${response.statusText} (${url})`);
    }
    throw lastError ?? new Error("OpenF1 API error");
  }
}

/** Shared default instance — fine for most apps. */
export const openF1 = new OpenF1Client();
