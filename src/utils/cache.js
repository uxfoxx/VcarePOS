import NodeCache from 'node-cache';

// Create a cache instance with default TTL of 10 minutes and check period of 60 seconds
const cache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

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