interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function rateLimiter(
  ip: string,
  limit = 30,
  windowMs = 60 * 60 * 1000 // 1 hour window
): { success: boolean; remaining: number } {
  // CRITICAL NOTE FOR SERVERLESS DEPLOYMENTS (e.g., Firebase App Hosting):
  // This rate limiter tracks request counts using an in-memory Map instance.
  // In serverless environments, memory is ephemeral, isolated, and non-shared
  // across container instances. The map state will reset when container instances
  // scale down, recycle, or spin up. This is a cost-effective, zero-dependency
  // solution suitable for preventing simple client-side flooding, but does not
  // guarantee strict rate limiting across multi-region server clusters.
  
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { timestamps: [now] });
    return { success: true, remaining: limit - 1 };
  }

  const record = rateLimitMap.get(ip)!;
  // Retain only timestamps that fall within the current sliding window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    return { success: false, remaining: 0 };
  }

  record.timestamps.push(now);
  return { success: true, remaining: limit - record.timestamps.length };
}
