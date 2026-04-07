import "server-only";
import { getRedisClient } from "@/utils/redis";

const RATE_LIMIT_CONFIGS = {
  login: { maxAttempts: 10, windowSeconds: 900 },     // 10 attempts per 15 min
  register: { maxAttempts: 5, windowSeconds: 3600 },  // 5 attempts per hour
};

/**
 * Checks whether an identifier (e.g. IP) has exceeded the rate limit for a
 * given action. Fails open when Redis is unavailable so auth is never blocked
 * by infrastructure issues.
 *
 * @returns {{ allowed: boolean, retryAfter?: number }}
 */
export async function checkRateLimit(action, identifier) {
  const config = RATE_LIMIT_CONFIGS[action];
  if (!config || !identifier) {
    return { allowed: true };
  }

  const client = await getRedisClient();
  if (!client) {
    // Redis unavailable — fail open rather than blocking legitimate users
    return { allowed: true };
  }

  const key = `rate:${action}:${identifier}`;

  try {
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, config.windowSeconds);
    }

    if (count > config.maxAttempts) {
      const retryAfter = await client.ttl(key);
      return { allowed: false, retryAfter: retryAfter > 0 ? retryAfter : config.windowSeconds };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}
