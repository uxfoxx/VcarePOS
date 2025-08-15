// Service Worker for HTTP caching
const CACHE_NAME = 'vcare-pos-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/VCARELogo 1.png',
  '/vite.svg'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Different caching strategies based on request type
  if (url.pathname.startsWith('/api/')) {
    // Network first, then cache for API requests
    event.respondWith(networkFirstStrategy(event.request));
  } else if (
    STATIC_ASSETS.includes(url.pathname) || 
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)
  ) {
    // Cache first for static assets
    event.respondWith(cacheFirstStrategy(event.request));
  } else {
    // Network only for other requests
    event.respondWith(fetch(event.request));
  }
});

// Cache-first strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache valid responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Fetch error:', error);
    // Return a fallback response if network request fails
    return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' } });
  }
}

// Network-first strategy
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache valid responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If cache fails too, return error response
    console.error('Network and cache both failed:', error);
    return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' } });
  }
}

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log('Cache cleared');
      })
    );
  }
});