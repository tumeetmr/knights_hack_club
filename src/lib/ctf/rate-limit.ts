import "server-only";
import { headers } from "next/headers";

/** Sliding-window attempt counts. In-memory, so limits are per server instance. */
const buckets = new Map<string, { hits: number[]; windowMs: number }>();

function sweep(now: number) {
  for (const [key, b] of buckets) {
    if (b.hits.every((t) => now - t >= b.windowMs)) buckets.delete(key);
  }
}

/** Records an attempt and returns true once `key` has gone over `max` inside the window. */
export function tooMany(key: string, max: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 500) sweep(now);
  const hits = (buckets.get(key)?.hits ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(key, { hits, windowMs });
  return hits.length > max;
}

export const clearAttempts = (key: string) => buckets.delete(key);

export async function clientIp() {
  return (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
}
