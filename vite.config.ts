import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Include .tsx files and ensure JSX runtime is available
      include: "**/*.{jsx,tsx}",
      jsxRuntime: 'automatic'
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
      external: (_id) => {
        // Don't externalize any dependencies - keep them bundled
        return false;
      },
      output: {
        // Put all assets in the assets directory for consistency
        assetFileNames: 'assets/[name]-[hash].[ext]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        manualChunks: (id) => {
          // Node modules chunking
          if (id.includes('node_modules')) {
            // Critical: Core React packages must be in their own chunk and load first
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core';
            }
            
            // State management that depends on React
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || 
                id.includes('redux-saga') || id.includes('redux-logger') || id.includes('reselect')) {
              return 'react-state';
            }
            
            // React Router
            if (id.includes('react-router')) {
              return 'react-router';
            }
            
            // Any library that might use React should go with React dependencies
            if (id.includes('use-sync-external-store') || 
                id.includes('scheduler') ||
                id.includes('react-is') ||
                id.includes('hoist-non-react-statics') ||
                id.includes('prop-types')) {
              return 'react-core';
            }
            
            // All Ant Design components need React and have interdependencies
            // Move them all to react-core to avoid initialization issues
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'react-core';
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
            // RC components (Ant Design dependencies) - need React, move to react-core
            if (id.includes('rc-')) {
              return 'react-core';
            }
            // Other large libraries
            if (id.includes('lodash') || id.includes('ramda') || 
                id.includes('classnames') || id.includes('clsx')) {
              return 'utility-libs';
            }
            
            // Any library that might use React should go with React dependencies
            if (id.includes('use-sync-external-store') || 
                id.includes('scheduler') ||
                id.includes('react-is') ||
                id.includes('hoist-non-react-statics') ||
                id.includes('prop-types')) {
              return 'react-core';
            }
            
            // Don't manually chunk remaining libraries - let Vite auto-chunk them
            // This prevents React dependency issues
            return undefined;
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
    chunkSizeWarningLimit: 1200, // Increased due to React+Antd being bundled together
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
      'react/jsx-runtime',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'antd',
      'dayjs'
    ],
    exclude: ['lucide-react'],
    force: true, // Force re-optimization
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
});
