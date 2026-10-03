/**
 * Centralized in-memory metrics tracker for Redis caching performance.
 */
class CacheMetrics {
  constructor() {
    this.hits = 0;
    this.misses = 0;
    this.errors = 0;
    this.totalCacheReadTimeMs = 0;
    this.totalDbReadTimeMs = 0;
    this.recentHits = [];
    this.recentMisses = [];
    this.startTime = Date.now();
  }

  recordHit(key, durationMs) {
    this.hits++;
    this.totalCacheReadTimeMs += durationMs;
    this.recentHits.push({ key, durationMs: Number(durationMs.toFixed(2)), timestamp: new Date().toISOString() });
    if (this.recentHits.length > 50) {
      this.recentHits.shift();
    }
  }

  recordMiss(key, durationMs) {
    this.misses++;
    this.totalDbReadTimeMs += durationMs;
    this.recentMisses.push({ key, durationMs: Number(durationMs.toFixed(2)), timestamp: new Date().toISOString() });
    if (this.recentMisses.length > 50) {
      this.recentMisses.shift();
    }
  }

  recordError(error, context = "") {
    this.errors++;
    console.warn(`[CacheMetrics] Redis error in ${context}:`, error.message);
  }

  getSnapshot() {
    const totalRequests = this.hits + this.misses;
    const hitRatio = totalRequests > 0 ? Number(((this.hits / totalRequests) * 100).toFixed(2)) : 0;
    const avgCacheReadTimeMs = this.hits > 0 ? Number((this.totalCacheReadTimeMs / this.hits).toFixed(2)) : 0;
    const avgDbReadTimeMs = this.misses > 0 ? Number((this.totalDbReadTimeMs / this.misses).toFixed(2)) : 0;
    const estimatedTimeSavedMs = this.hits * Math.max(0, avgDbReadTimeMs - avgCacheReadTimeMs);

    return {
      status: "healthy",
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      totalCacheRequests: totalRequests,
      hits: this.hits,
      misses: this.misses,
      hitRatioPercentage: `${hitRatio}%`,
      errors: this.errors,
      performance: {
        avgCacheReadTimeMs,
        avgDbReadTimeMs,
        estimatedTimeSavedTotalMs: Number(estimatedTimeSavedMs.toFixed(2)),
        speedupFactor: avgCacheReadTimeMs > 0 ? `${Number((avgDbReadTimeMs / avgCacheReadTimeMs).toFixed(1))}x` : "N/A",
      },
      recentActivity: {
        hits: this.recentHits.slice(-10),
        misses: this.recentMisses.slice(-10),
      },
    };
  }

  reset() {
    this.hits = 0;
    this.misses = 0;
    this.errors = 0;
    this.totalCacheReadTimeMs = 0;
    this.totalDbReadTimeMs = 0;
    this.recentHits = [];
    this.recentMisses = [];
    this.startTime = Date.now();
  }
}

export const cacheMetrics = new CacheMetrics();
export default cacheMetrics;
