/**
 * Utility functions for HTTP caching
 */

/**
 * Clear the service worker cache
 * @returns {Promise<void>}
 */
export const clearCache = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
    console.log('Cache clear request sent to service worker');
  }
};

/**
 * Set cache control headers for a response
 * @param {Response} response - The response to modify
 * @param {number} maxAge - Max age in seconds
 * @returns {Response} - Modified response with cache headers
 */
export const setCacheHeaders = (response, maxAge = 300) => {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', `public, max-age=${maxAge}`);
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};

/**
 * Fetch with cache control
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} maxAge - Max age in seconds
 * @returns {Promise<Response>} - Response with cache headers
 */
export const fetchWithCache = async (url, options = {}, maxAge = 300) => {
  options.headers = {
    ...options.headers,
    'Cache-Control': `public, max-age=${maxAge}`
  };
  
  const response = await fetch(url, options);
  return setCacheHeaders(response, maxAge);
};

/**
 * Check if a response is cacheable
 * @param {Response} response - The response to check
 * @returns {boolean} - Whether the response is cacheable
 */
export const isCacheable = (response) => {
  // Only cache successful responses
  if (!response.ok) return false;
  
  // Check cache control headers
  const cacheControl = response.headers.get('Cache-Control');
  if (cacheControl && cacheControl.includes('no-store')) return false;
  if (cacheControl && cacheControl.includes('private')) return false;
  
  return true;
};