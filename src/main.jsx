import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Set HTTP cache headers for static assets
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// Add cache control headers to fetch requests
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
  // Add cache control headers for API requests
  if (typeof url === 'string' && url.includes('/api/')) {
    options.headers = {
      ...options.headers,
      'Cache-Control': 'public, max-age=300', // 5 minutes cache for API responses
    };
  }
  
  return originalFetch(url, options);
};

createRoot(document.getElementById('root')).render(
  <App />
);