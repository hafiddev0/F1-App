// Server-side entry point into the framework-agnostic OpenF1 client.
// Caching, de-duplication, spacing and 429 backoff all live in src/f1-core.

import { OpenF1Client } from "@/f1-core/openf1-client";

export const openF1Client = new OpenF1Client();

export function fetchOpenF1<T>(
  path: string,
  params?: Record<string, string | number>,
  ttlMs = 15_000,
): Promise<T> {
  return openF1Client.get<T>(path, params, ttlMs);
}
