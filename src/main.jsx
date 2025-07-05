import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/main.scss';
import './styles/branding.css';

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

// Apply saved branding on app start
const applyInitialBranding = () => {
  const savedBranding = localStorage.getItem('vcare_branding');
  if (savedBranding) {
    const parsedBranding = JSON.parse(savedBranding);
    
    // Create a style element if it doesn't exist
    let styleEl = document.getElementById('branding-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'branding-styles';
      document.head.appendChild(styleEl);
    }
    
    // Update CSS variables
    styleEl.innerHTML = `
      :root {
        --primary-color: ${parsedBranding.primaryColor || '#0E72BD'};
        --secondary-color: ${parsedBranding.secondaryColor || '#52c41a'};
        --accent-color: ${parsedBranding.accentColor || '#fa8c16'};
        --font-family: ${parsedBranding.fontFamily || 'Inter'}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      
      .ant-btn-primary {
        background-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
        border-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }
      
      .text-blue-600, .text-\[#0E72BD\] {
        color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }
      
      .bg-blue-600, .bg-\[#0E72BD\] {
        background-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }
      
      .border-blue-600, .border-\[#0E72BD\] {
        border-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }
      
      body {
        font-family: ${parsedBranding.fontFamily || 'Inter'}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
    `;
  }
};

// Apply branding before rendering
applyInitialBranding();

createRoot(document.getElementById('root')).render(
  <App />
);