import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Include .tsx files
      include: "**/*.{jsx,tsx}",
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Node modules chunking
          if (id.includes('node_modules')) {
            // Core React packages
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            
            // Split Ant Design into smaller chunks
            if (id.includes('antd') || id.includes('@ant-design')) {
              // Ant Design core components (commonly used)
              if (id.includes('button') || id.includes('input') || id.includes('form') || 
                  id.includes('modal') || id.includes('message') || id.includes('notification')) {
                return 'antd-core';
              }
              // Ant Design table and data display
              if (id.includes('table') || id.includes('list') || id.includes('tree') || 
                  id.includes('descriptions') || id.includes('statistic')) {
                return 'antd-data';
              }
              // Ant Design navigation and layout
              if (id.includes('menu') || id.includes('layout') || id.includes('breadcrumb') || 
                  id.includes('steps') || id.includes('tabs')) {
                return 'antd-navigation';
              }
              // Ant Design date and time
              if (id.includes('date-picker') || id.includes('time-picker') || id.includes('calendar')) {
                return 'antd-date';
              }
              // All other Ant Design components
              return 'antd-misc';
            }
            
            // State management
            if (id.includes('@reduxjs/toolkit') || id.includes('redux') || id.includes('reselect')) {
              return 'redux-state';
            }
            // Router
            if (id.includes('react-router')) {
              return 'router';
            }
            // PDF and Canvas utilities
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-utils';
            }
            // Date utilities
            if (id.includes('dayjs') || id.includes('moment')) {
              return 'date-utils';
            }
            // Image processing
            if (id.includes('react-image-crop')) {
              return 'image-utils';
            }
            // Icons
            if (id.includes('@ant-design/icons')) {
              return 'antd-icons';
            }
            // RC components (Ant Design dependencies)
            if (id.includes('rc-')) {
              return 'rc-components';
            }
            // Other large libraries
            if (id.includes('lodash') || id.includes('ramda')) {
              return 'utility-libs';
            }
            // All other node_modules
            return 'vendor-misc';
          }
          
          // App code chunking
          // POS related components
          if (id.includes('/POS/') || id.includes('/Cart') || id.includes('/Checkout')) {
            return 'pos-components';
          }
          // Product management
          if (id.includes('/Products/') || id.includes('/Categories/')) {
            return 'product-components';
          }
          // Purchase orders
          if (id.includes('/PurchaseOrders/')) {
            return 'purchase-components';
          }
          // Reports and analytics
          if (id.includes('/Reports/') || id.includes('/Analytics/')) {
            return 'report-components';
          }
          // Settings and configuration
          if (id.includes('/Settings/') || id.includes('/Users/')) {
            return 'admin-components';
          }
          // Common components
          if (id.includes('/common/')) {
            return 'common-components';
          }
        },
      },
    },
    chunkSizeWarningLimit: 800, // Increased due to proper code splitting
  },
  server: {
    port: 3001,
    open: true,
    cors: true,
    host: true,
  },
  preview: {
    port: 3001,
    open: true,
    cors: true,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'antd',
      'dayjs'
    ],
    exclude: ['lucide-react'],
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
});
