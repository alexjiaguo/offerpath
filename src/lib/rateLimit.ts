const buckets = new Map<string, number[]>();
const MAX_BUCKETS = 10_000;
let lastSweep = 0;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): boolean {
  if (buckets.size >= MAX_BUCKETS && now - lastSweep > windowMs) {
    lastSweep = now;
    for (const [k, hits] of buckets) {
      const fresh = hits.filter((t) => t > now - windowMs);
      if (fresh.length === 0) buckets.delete(k);
      else buckets.set(k, fresh);
    }
  }

  const hits = (buckets.get(key) ?? []).filter((t) => t > now - windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

export function clientIpFromHeaders(headers: Headers): string {
  // Prefer x-real-ip: on Vercel/typical proxies it is set by the edge from
  // the actual TCP peer, while x-forwarded-for's leftmost entry is
  // client-controlled and trivially spoofed to rotate rate-limit buckets.
  // NOTE: this limiter is still per-instance in-memory — it degrades to
  // per-instance fairness when scaled horizontally. A shared store (Redis /
  // Upstash) is needed for exact global limits.
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return "unknown";
}
