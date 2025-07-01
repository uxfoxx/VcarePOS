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
export const getOrFetch = async (key, fetchFn, ttl = 600) => {
  // Try to get data from cache
  const cachedData = cache.get(key);
  
  // If data exists in cache, return it
  if (cachedData !== undefined) {
    console.log(`Cache hit for key: ${key}`);
    return cachedData;
  }
  
  // If not in cache, fetch data
  console.log(`Cache miss for key: ${key}, fetching data...`);
  const data = await fetchFn();
  
  // Store data in cache
  cache.set(key, data, ttl);
  
  return data;
};

/**
 * Invalidate a specific cache key
 * @param {string} key - Cache key to invalidate
 */
export const invalidateCache = (key) => {
  console.log(`Invalidating cache for key: ${key}`);
  cache.del(key);
};

/**
 * Invalidate multiple cache keys by prefix
 * @param {string} prefix - Prefix of cache keys to invalidate
 */
export const invalidateCacheByPrefix = (prefix) => {
  console.log(`Invalidating cache for prefix: ${prefix}`);
  const keys = cache.keys();
  const keysToDelete = keys.filter(key => key.startsWith(prefix));
  
  keysToDelete.forEach(key => {
    cache.del(key);
  });
  
  return keysToDelete.length;
};

/**
 * Flush the entire cache
 */
export const flushCache = () => {
  console.log('Flushing entire cache');
  cache.flushAll();
};

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
export const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
};

export default cache;