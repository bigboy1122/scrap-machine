export interface TickEngine {
  start(): void;
  stop(): void;
  /** Call directly in tests to advance a tick without real time. */
  tick(): void;
}

export function createTickEngine(
  intervalMs: number,
  onTick: () => void,
): TickEngine {
  let handle: ReturnType<typeof setInterval> | null = null;

  return {
    start() {
      if (handle !== null) return;
      handle = setInterval(onTick, intervalMs);
    },
    stop() {
      if (handle === null) return;
      clearInterval(handle);
      handle = null;
    },
    tick() {
      onTick();
    },
  };
}
