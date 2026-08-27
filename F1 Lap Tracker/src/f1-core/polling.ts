/**
 * Minimal polling loop — framework-agnostic replacement for TanStack Query's
 * `refetchInterval`. Wrap it in an Angular service (or an RxJS `interval`) to
 * drive live updates.
 */

export interface PollOptions<T> {
  /** Milliseconds between the end of one fetch and the start of the next. */
  intervalMs: number;
  /** Called with each successful result. */
  onData: (data: T) => void;
  /** Called when a fetch throws. Polling continues regardless. */
  onError?: (error: unknown) => void;
  /** Run the first fetch immediately. Default true. */
  immediate?: boolean;
}

export interface Poller {
  /** Stop the loop. Safe to call multiple times. */
  stop: () => void;
  /** Trigger a fetch right now without waiting for the next tick. */
  refresh: () => void;
}

/**
 * Poll an async function until stopped.
 *
 *   const poller = poll(() => openF1.getPositions(key), {
 *     intervalMs: 5000,
 *     onData: (rows) => (this.positions = rows),
 *   });
 *   // later: poller.stop()
 */
export function poll<T>(fetcher: () => Promise<T>, options: PollOptions<T>): Poller {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = false;

  const tick = async () => {
    if (stopped || running) return;
    running = true;
    try {
      const data = await fetcher();
      if (!stopped) options.onData(data);
    } catch (error) {
      if (!stopped) options.onError?.(error);
    } finally {
      running = false;
      if (!stopped) timer = setTimeout(tick, options.intervalMs);
    }
  };

  if (options.immediate !== false) {
    void tick();
  } else {
    timer = setTimeout(tick, options.intervalMs);
  }

  return {
    stop: () => {
      stopped = true;
      if (timer !== undefined) clearTimeout(timer);
    },
    refresh: () => {
      if (timer !== undefined) clearTimeout(timer);
      void tick();
    },
  };
}
