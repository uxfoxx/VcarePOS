// Browser-compatible in-memory cache implementation
class BrowserCache {
  constructor(options = {}) {
    this.stdTTL = options.stdTTL || 600; // Default TTL in seconds
    this.checkperiod = options.checkperiod || 60; // Check period in seconds
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      keys: 0,
      sets: 0,
      dels: 0
    };
    
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.checkperiod * 1000);
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return undefined;
    }
    
    // Check if item has expired
    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key);
      this.stats.misses++;
      return undefined;
    }
    
    this.stats.hits++;
    return item.value;
  }

  set(key, value, ttl) {
    const timeToLive = ttl || this.stdTTL;
    const expires = timeToLive > 0 ? Date.now() + (timeToLive * 1000) : null;
    
    this.cache.set(key, {
      value,
      expires,
      created: Date.now()
    });
    
    this.stats.sets++;
    this.stats.keys = this.cache.size;
    return true;
  }

  del(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.dels++;
      this.stats.keys = this.cache.size;
    }
    return deleted;
  }

  keys() {
    return Array.from(this.cache.keys());
  }

  flushAll() {
    this.cache.clear();
    this.stats.keys = 0;
    return true;
  }

  getStats() {
    return {
      ...this.stats,
      ksize: this.cache.size,
      vsize: this.calculateValueSize()
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expires && now > item.expires) {
        this.cache.delete(key);
      }
    }
    this.stats.keys = this.cache.size;
  }

  calculateValueSize() {
    let size = 0;
    for (const [key, item] of this.cache.entries()) {
      // Rough estimation of memory usage
      size += JSON.stringify(key).length;
      size += JSON.stringify(item.value).length;
    }
    return size;
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Create a cache instance with default TTL of 10 minutes and check period of 60 seconds
const cache = new BrowserCache({ stdTTL: 600, checkperiod: 60 });

/**
 * Get data from cache or fetch it using the provided function
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch data if not in cache
 * @param {number} ttl - Time to live in seconds (optional)
 * @returns {Promise<any>} - Cached or fetched data
 */
export const getOrFetch = async (key, fetchFn, _ttl = 600) => {
  // Directly fetch data without caching
  const data = await fetchFn();
  return data;
};

/**
 * Invalidate a specific cache key
 * @param {string} key - Cache key to invalidate
 */
export const invalidateCache = (_key) => {
  // No-op since caching is disabled
  return;
};

/**
 * Invalidate multiple cache keys by prefix
 * @param {string} prefix - Prefix of cache keys to invalidate
 */
export const invalidateCacheByPrefix = (_prefix) => {
  // No-op since caching is disabled
  return 0;
};

/**
 * Flush the entire cache
 */
export const flushCache = () => {
  // No-op since caching is disabled
  return;
};

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
export const getCacheStats = () => {
  // Return empty stats since caching is disabled
  return { keys: 0, hits: 0, misses: 0, ksize: 0, vsize: 0 };
};

export default cache;