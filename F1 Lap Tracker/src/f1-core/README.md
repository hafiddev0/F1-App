# f1-core — framework-agnostic F1 data layer

Plain TypeScript. No React, no Angular, no DOM APIs beyond `fetch` and timers.
Copy this folder into any TypeScript project and it compiles as-is.

## Files

| File                | Contents                                                                       |
| ------------------- | ------------------------------------------------------------------------------ |
| `types.ts`          | OpenF1 payload interfaces + view models (`TimingRow`, `TelemetryPoint`)          |
| `openf1-client.ts`  | `OpenF1Client`: typed endpoints, caching, de-duplication, spacing, 429 backoff   |
| `transforms.ts`     | Pure functions: `buildTimingRows`, `buildTelemetryPoints`, `findLatest`, …       |
| `format.ts`         | Lap/gap/clock formatting, team + tyre hex colors, race-control severity          |
| `polling.ts`        | `poll()` — a tiny live-refresh loop                                              |
| `index.ts`          | Barrel export                                                                    |

## Usage in an Angular app

```ts
// f1.service.ts
import { Injectable, OnDestroy } from "@angular/core";
import { OpenF1Client, buildTimingRows, poll, type TimingRow, type Poller } from "./f1-core";

@Injectable({ providedIn: "root" })
export class F1Service implements OnDestroy {
  private readonly api = new OpenF1Client(); // or new OpenF1Client({ baseUrl: "/api/openf1" })
  private poller?: Poller;

  rows: TimingRow[] = [];

  async start() {
    const session = await this.api.getLatestSession();
    if (!session) return;
    const key = session.session_key;

    this.poller = poll(
      async () =>
        buildTimingRows(
          await this.api.getPositions(key),
          await this.api.getDrivers(key),
          await this.api.getIntervals(key),
          await this.api.getLaps(key),
          await this.api.getStints(key),
        ),
      { intervalMs: 5000, onData: (rows) => (this.rows = rows) },
    );
  }

  ngOnDestroy() {
    this.poller?.stop();
  }
}
```

Template colors come from `format.ts` as hex, so bind them directly:

```html
<span [style.color]="getTeamColor(row.teamName)">{{ row.acronym }}</span>
<span>{{ formatLapTime(row.lastLap) }}</span>
```

## CORS note

`https://api.openf1.org/v1` does not always send permissive CORS headers, so
browser-side calls can be blocked. Either proxy it (Angular CLI `proxy.conf.json`,
or your own backend) and pass `new OpenF1Client({ baseUrl: "/api/openf1" })`, or
call the client from a server process. This React app takes the second route —
`src/lib/openf1.functions.ts` calls the same client on the server.

## Rate limiting

OpenF1 returns 429 under load. The client already caches for 15s, de-duplicates
concurrent identical requests, spaces outbound calls 350ms apart and retries with
exponential backoff. Tune via the constructor:

```ts
new OpenF1Client({ cacheTtlMs: 30_000, minSpacingMs: 500, maxRetries: 5 });
```
