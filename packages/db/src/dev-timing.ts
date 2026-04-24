const DEV_TIMING_ENABLED = process.env.AAS_PERF_LOGS === "1" || process.env.NODE_ENV !== "production";

export function logDevTiming(label: string, startedAt: number, details?: string) {
  if (!DEV_TIMING_ENABLED) {
    return;
  }

  const durationMs = Date.now() - startedAt;
  const suffix = details ? ` ${details}` : "";
  process.stdout.write(`[perf] ${label} ${durationMs}ms${suffix}\n`);
}

export async function withDevTiming<T>(label: string, work: () => Promise<T>, details?: string) {
  const startedAt = Date.now();

  try {
    return await work();
  } finally {
    logDevTiming(label, startedAt, details);
  }
}
