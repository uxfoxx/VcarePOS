/**
 * Utility functions for HTTP caching
 */

/**
 * Clear the service worker cache
 * @returns {Promise<void>}
 */
export const clearCache = () => {
  // No-op since caching is disabled
  return Promise.resolve();
};

/**
 * Set cache control headers for a response
 * @param {Response} response - The response to modify
 * @param {number} maxAge - Max age in seconds
 * @returns {Response} - Modified response with cache headers
 */
export const setCacheHeaders = (response, maxAge = 300) => {
  // Return original response since caching is disabled
  return response;
};

/**
 * Fetch with cache control
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} maxAge - Max age in seconds
 * @returns {Promise<Response>} - Response with cache headers
 */
export const fetchWithCache = async (url, options = {}, maxAge = 300) => {
  // Fetch without cache headers
  return fetch(url, options);
};

/**
 * Check if a response is cacheable
 * @param {Response} response - The response to check
 * @returns {boolean} - Whether the response is cacheable
 */
export const isCacheable = (response) => {
  // Always return false since caching is disabled
  return false;
};