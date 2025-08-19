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
    sourcemap: true,
    minify: false,
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
        // Simplified manualChunks to avoid aggressive/fragile chunking
        manualChunks: (id) => {
          // All third-party libraries go into vendor chunks
          if (id.includes('node_modules')) {
            // Keep React and AntD-related code together to ensure predictable init order
            if (id.includes('react') || id.includes('react-dom') || id.includes('antd') || id.includes('@ant-design')) {
              return 'vendor.react';
            }
            // All other node_modules into a generic vendor chunk
            return 'vendor';
          }

          // Keep shared app-level common components together
          if (id.includes('/src/components/common/') || id.includes('/common/')) {
            return 'common-components';
          }

          // Let Rollup/Vite decide for everything else
          return undefined;
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
