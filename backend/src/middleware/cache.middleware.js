import { cacheService } from "../services/cache.service.js";

/**
 * Express middleware for automatic HTTP response caching.
 * Adds 'X-Cache: HIT' or 'X-Cache: MISS' headers and caches 200 OK JSON responses.
 *
 * @param {number} [ttlSeconds=300]
 * @param {(req: import('express').Request) => string} [customKeyBuilder]
 */
export function cacheResponse(ttlSeconds = 300, customKeyBuilder = null) {
  return async (req, res, next) => {
    // Only cache safe GET requests
    if (req.method !== "GET" || !cacheService.isReady()) {
      return next();
    }

    const start = performance.now();

    // Default key includes route, user identity/role if present, and query string
    const key = customKeyBuilder
      ? customKeyBuilder(req)
      : `york:http:${req.user?.role || "anon"}:${req.user?.id || "public"}:${req.baseUrl}${req.path}:${JSON.stringify(req.query)}`;

    try {
      const cachedData = await cacheService.get(key);
      if (cachedData !== null) {
        const duration = (performance.now() - start).toFixed(2);
        res.setHeader("X-Cache", "HIT");
        res.setHeader("X-Cache-Key", key);
        res.setHeader("X-Response-Time", `${duration}ms`);
        return res.json(cachedData);
      }
    } catch (err) {
      // Pass-through to live controller if Redis read fails
    }

    res.setHeader("X-Cache", "MISS");

    // Intercept res.json to capture response payload
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful 200/201 responses
      if (res.statusCode >= 200 && res.statusCode < 300 && body && body.success !== false) {
        cacheService.set(key, body, ttlSeconds).catch(() => {});
      }
      const duration = (performance.now() - start).toFixed(2);
      res.setHeader("X-Response-Time", `${duration}ms`);
      return originalJson(body);
    };

    next();
  };
}

export default cacheResponse;
