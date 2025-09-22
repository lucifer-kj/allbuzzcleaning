import type { NextRequest } from 'next/server';

type RateLimitOptions = {
  /** Max requests per window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
  /** Optional bucket key to scope limits per endpoint */
  key?: string;
  /** Optional custom identifier (e.g., user id). Defaults to client IP. */
  identifier?: string;
};

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return (request as any)?.ip || '0.0.0.0';
}

export function checkRateLimit(
  request: NextRequest,
  { limit, windowMs, key = 'default', identifier }: RateLimitOptions
): { ok: boolean; remaining: number; resetAt: number } {
  const ip = identifier || getClientIp(request);
  const now = Date.now();
  const bucketKey = `${key}:${ip}`;
  const current = buckets.get(bucketKey);

  if (!current || now > current.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(bucketKey, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  if (current.count >= limit) {
    return { ok: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  buckets.set(bucketKey, current);
  return { ok: true, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt };
}

