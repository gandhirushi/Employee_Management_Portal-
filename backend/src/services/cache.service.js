import { getRedisClient, isRedisReady } from "../config/redis.js";
import { cacheMetrics } from "../utils/cacheMetrics.js";

/**
 * High-performance, fault-tolerant Redis Cache Service.
 * Implements Cache-Aside pattern with non-blocking pattern invalidation
 * and automatic fallback to direct database access if Redis is unavailable.
 */
export class CacheService {
  /**
   * Retrieves a cached value by key.
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    if (!key || !isRedisReady()) return null;

    try {
      const client = getRedisClient();
      const raw = await client.get(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      cacheMetrics.recordError(err, `get(${key})`);
      return null;
    }
  }

  /**
   * Stores a value in Redis with a TTL in seconds.
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlSeconds=300]
   * @returns {Promise<boolean>}
   */
  async set(key, value, ttlSeconds = 300) {
    if (!key || value === undefined || !isRedisReady()) return false;

    try {
      const client = getRedisClient();
      const serialized = JSON.stringify(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await client.set(key, serialized, "EX", ttlSeconds);
      } else {
        await client.set(key, serialized);
      }
      return true;
    } catch (err) {
      cacheMetrics.recordError(err, `set(${key})`);
      return false;
    }
  }

  /**
   * Deletes a single key from Redis.
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async del(key) {
    if (!key || !isRedisReady()) return false;

    try {
      const client = getRedisClient();
      await client.del(key);
      return true;
    } catch (err) {
      cacheMetrics.recordError(err, `del(${key})`);
      return false;
    }
  }

  /**
   * Deletes all keys matching a wildcard pattern using non-blocking SCAN.
   * Never uses KEYS * to avoid blocking Redis production threads.
   * @param {string} pattern - e.g. "york:employees:*"
   * @returns {Promise<number>} Number of keys deleted
   */
  async delByPattern(pattern) {
    if (!pattern || !isRedisReady()) return 0;

    try {
      const client = getRedisClient();
      let cursor = "0";
      let totalDeleted = 0;

      do {
        // Scan in chunks of 100 keys
        const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = nextCursor;

        if (keys && keys.length > 0) {
          // Pipeline unlink/del for non-blocking asynchronous memory release
          const pipeline = client.pipeline();
          keys.forEach((k) => pipeline.unlink(k));
          await pipeline.exec();
          totalDeleted += keys.length;
        }
      } while (cursor !== "0");

      if (totalDeleted > 0) {
        console.log(`[CacheService] Evicted ${totalDeleted} key(s) matching pattern: "${pattern}"`);
      }
      return totalDeleted;
    } catch (err) {
      cacheMetrics.recordError(err, `delByPattern(${pattern})`);
      return 0;
    }
  }

  /**
   * Atomic Cache-Aside Fetcher:
   * 1. Check cache for key -> return if found (Cache HIT)
   * 2. If missing -> execute fetchFn() (Cache MISS), store in cache with TTL, return result.
   * 3. Fault-tolerant: if Redis fails, fetchFn() executes transparently without throwing.
   *
   * @param {string} key
   * @param {() => Promise<any>} fetchFn
   * @param {number} ttlSeconds
   * @returns {Promise<any>}
   */
  async getOrSet(key, fetchFn, ttlSeconds = 300) {
    if (!isRedisReady()) {
      // Direct pass-through if Redis is offline or not configured
      return fetchFn();
    }

    const readStart = performance.now();
    try {
      const cached = await this.get(key);
      if (cached !== null) {
        const duration = performance.now() - readStart;
        cacheMetrics.recordHit(key, duration);
        return cached;
      }
    } catch (err) {
      // Continue to DB fallback
    }

    // Cache Miss: Query Database
    const dbStart = performance.now();
    const freshData = await fetchFn();
    const dbDuration = performance.now() - dbStart;
    cacheMetrics.recordMiss(key, dbDuration);

    // Populate cache asynchronously without blocking response
    if (freshData !== undefined && freshData !== null) {
      this.set(key, freshData, ttlSeconds).catch((err) => {
        cacheMetrics.recordError(err, `getOrSet.set(${key})`);
      });
    }

    return freshData;
  }

  /**
   * Clears the entire database (use with care).
   */
  async flushAll() {
    if (!isRedisReady()) return false;
    try {
      const client = getRedisClient();
      await client.flushdb();
      console.log("[CacheService] Cache database cleared (FLUSHDB).");
      return true;
    } catch (err) {
      cacheMetrics.recordError(err, "flushAll");
      return false;
    }
  }

  isReady() {
    return isRedisReady();
  }
}

export const cacheService = new CacheService();
export default cacheService;
