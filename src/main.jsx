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
        --primary-color-rgb: ${parsedBranding.primaryColor ? 
          `${parseInt(parsedBranding.primaryColor.slice(1, 3), 16)}, ${parseInt(parsedBranding.primaryColor.slice(3, 5), 16)}, ${parseInt(parsedBranding.primaryColor.slice(5, 7), 16)}` : 
          '14, 114, 189'};
        --font-family: ${parsedBranding.fontFamily || 'Inter'}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
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

      .ant-switch-checked {
        background-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }

      .ant-checkbox-checked .ant-checkbox-inner {
        background-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
        border-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }

      .ant-pagination-item-active {
        border-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }

      .ant-pagination-item-active a {
        color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }

      .ant-slider-track {
        background-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }

      .ant-slider-handle::after {
        box-shadow: 0 0 0 2px ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }

      .ant-btn-link {
        color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }

      .ant-menu-light .ant-menu-submenu-selected >.ant-menu-submenu-title {
        color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }

      .ant-radio-checked .ant-radio-inner {
        border-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }

      .ant-radio-inner::after {
        background-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }

      .ant-tabs-ink-bar {
        background-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }

      .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
        color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }

      .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
        background-color: rgba(${parsedBranding.primaryColor ? 
          `${parseInt(parsedBranding.primaryColor.slice(1, 3), 16)}, ${parseInt(parsedBranding.primaryColor.slice(3, 5), 16)}, ${parseInt(parsedBranding.primaryColor.slice(5, 7), 16)}` : 
          '14, 114, 189'}, 0.1) !important;
      }

      .ant-select-focused .ant-select-selector {
        border-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
        box-shadow: 0 0 0 2px rgba(${parsedBranding.primaryColor ? 
          `${parseInt(parsedBranding.primaryColor.slice(1, 3), 16)}, ${parseInt(parsedBranding.primaryColor.slice(3, 5), 16)}, ${parseInt(parsedBranding.primaryColor.slice(5, 7), 16)}` : 
          '14, 114, 189'}, 0.2) !important;
      }

      .ant-input:focus, 
      .ant-input-focused {
        border-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
        box-shadow: 0 0 0 2px rgba(${parsedBranding.primaryColor ? 
          `${parseInt(parsedBranding.primaryColor.slice(1, 3), 16)}, ${parseInt(parsedBranding.primaryColor.slice(3, 5), 16)}, ${parseInt(parsedBranding.primaryColor.slice(5, 7), 16)}` : 
          '14, 114, 189'}, 0.2) !important;
      }

      .ant-input-affix-wrapper:focus,
      .ant-input-affix-wrapper-focused {
        border-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
        box-shadow: 0 0 0 2px rgba(${parsedBranding.primaryColor ? 
          `${parseInt(parsedBranding.primaryColor.slice(1, 3), 16)}, ${parseInt(parsedBranding.primaryColor.slice(3, 5), 16)}, ${parseInt(parsedBranding.primaryColor.slice(5, 7), 16)}` : 
          '14, 114, 189'}, 0.2) !important;
      }

      .ant-picker-focused {
        border-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
        box-shadow: 0 0 0 2px rgba(${parsedBranding.primaryColor ? 
          `${parseInt(parsedBranding.primaryColor.slice(1, 3), 16)}, ${parseInt(parsedBranding.primaryColor.slice(3, 5), 16)}, ${parseInt(parsedBranding.primaryColor.slice(5, 7), 16)}` : 
          '14, 114, 189'}, 0.2) !important;
      }

      .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
        background-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }

      .ant-tag-blue {
        color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
        background: rgba(${parsedBranding.primaryColor ? 
          `${parseInt(parsedBranding.primaryColor.slice(1, 3), 16)}, ${parseInt(parsedBranding.primaryColor.slice(3, 5), 16)}, ${parseInt(parsedBranding.primaryColor.slice(5, 7), 16)}` : 
          '14, 114, 189'}, 0.1) !important;
        border-color: rgba(${parsedBranding.primaryColor ? 
          `${parseInt(parsedBranding.primaryColor.slice(1, 3), 16)}, ${parseInt(parsedBranding.primaryColor.slice(3, 5), 16)}, ${parseInt(parsedBranding.primaryColor.slice(5, 7), 16)}` : 
          '14, 114, 189'}, 0.3) !important;
      }

      .ant-progress-bg {
        background-color: ${parsedBranding.primaryColor || '#0E72BD'} !important;
      }
      
      body {
        font-family: ${parsedBranding.fontFamily || 'Inter'}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      }
    `;
  }
};

// Apply branding before rendering
applyInitialBranding();

createRoot(document.getElementById('root')).render(
  <App />
);