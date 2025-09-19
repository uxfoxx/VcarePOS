// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig({
  plugins: [
    react({
      // Include .tsx files and ensure JSX runtime is available
      include: "**/*.{jsx,tsx}",
      jsxRuntime: "automatic"
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      external: (_id) => {
        return false;
      },
      output: {
        // Put all assets in the assets directory for consistency
        assetFileNames: "assets/[name]-[hash].[ext]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-core";
            }
            if (id.includes("@reduxjs/toolkit") || id.includes("react-redux") || id.includes("redux-saga") || id.includes("redux-logger") || id.includes("reselect")) {
              return "react-state";
            }
            if (id.includes("react-router")) {
              return "react-router";
            }
            if (id.includes("use-sync-external-store") || id.includes("scheduler") || id.includes("react-is") || id.includes("hoist-non-react-statics") || id.includes("prop-types")) {
              return "react-core";
            }
            if (id.includes("antd") || id.includes("@ant-design")) {
              return "react-core";
            }
            if (id.includes("react-router")) {
              return "router";
            }
            if (id.includes("jspdf") || id.includes("html2canvas")) {
              return "pdf-utils";
            }
            if (id.includes("dayjs") || id.includes("moment")) {
              return "date-utils";
            }
            if (id.includes("react-image-crop")) {
              return "image-utils";
            }
            if (id.includes("@ant-design/icons")) {
              return "antd-icons";
            }
            if (id.includes("rc-")) {
              return "react-core";
            }
            if (id.includes("lodash") || id.includes("ramda") || id.includes("classnames") || id.includes("clsx")) {
              return "utility-libs";
            }
            if (id.includes("use-sync-external-store") || id.includes("scheduler") || id.includes("react-is") || id.includes("hoist-non-react-statics") || id.includes("prop-types")) {
              return "react-core";
            }
            return void 0;
          }
          if (id.includes("/POS/") || id.includes("/Cart") || id.includes("/Checkout")) {
            return "pos-components";
          }
          if (id.includes("/Products/") || id.includes("/Categories/")) {
            return "product-components";
          }
          if (id.includes("/PurchaseOrders/")) {
            return "purchase-components";
          }
          if (id.includes("/Reports/") || id.includes("/Analytics/")) {
            return "report-components";
          }
          if (id.includes("/Settings/") || id.includes("/Users/")) {
            return "admin-components";
          }
          if (id.includes("/common/")) {
            return "common-components";
          }
        }
      }
    },
    chunkSizeWarningLimit: 1200
    // Increased due to React+Antd being bundled together
  },
  server: {
    port: 3001,
    open: true,
    cors: true,
    host: true
  },
  preview: {
    port: 3001,
    open: true,
    cors: true
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react-router-dom",
      "@reduxjs/toolkit",
      "react-redux",
      "antd",
      "dayjs"
    ],
    exclude: ["lucide-react"],
    force: true
    // Force re-optimization
  },
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCh7XG4gICAgICAvLyBJbmNsdWRlIC50c3ggZmlsZXMgYW5kIGVuc3VyZSBKU1ggcnVudGltZSBpcyBhdmFpbGFibGVcbiAgICAgIGluY2x1ZGU6IFwiKiovKi57anN4LHRzeH1cIixcbiAgICAgIGpzeFJ1bnRpbWU6ICdhdXRvbWF0aWMnXG4gICAgfSlcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiAnZXMyMDIwJyxcbiAgICBvdXREaXI6ICdkaXN0JyxcbiAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiAoX2lkKSA9PiB7XG4gICAgICAgIC8vIERvbid0IGV4dGVybmFsaXplIGFueSBkZXBlbmRlbmNpZXMgLSBrZWVwIHRoZW0gYnVuZGxlZFxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIC8vIFB1dCBhbGwgYXNzZXRzIGluIHRoZSBhc3NldHMgZGlyZWN0b3J5IGZvciBjb25zaXN0ZW5jeVxuICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdJyxcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBtYW51YWxDaHVua3M6IChpZCkgPT4ge1xuICAgICAgICAgIC8vIE5vZGUgbW9kdWxlcyBjaHVua2luZ1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgIC8vIENyaXRpY2FsOiBDb3JlIFJlYWN0IHBhY2thZ2VzIG11c3QgYmUgaW4gdGhlaXIgb3duIGNodW5rIGFuZCBsb2FkIGZpcnN0XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlYWN0JykgfHwgaWQuaW5jbHVkZXMoJ3JlYWN0LWRvbScpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAncmVhY3QtY29yZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFN0YXRlIG1hbmFnZW1lbnQgdGhhdCBkZXBlbmRzIG9uIFJlYWN0XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0ByZWR1eGpzL3Rvb2xraXQnKSB8fCBpZC5pbmNsdWRlcygncmVhY3QtcmVkdXgnKSB8fCBcbiAgICAgICAgICAgICAgICBpZC5pbmNsdWRlcygncmVkdXgtc2FnYScpIHx8IGlkLmluY2x1ZGVzKCdyZWR1eC1sb2dnZXInKSB8fCBpZC5pbmNsdWRlcygncmVzZWxlY3QnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ3JlYWN0LXN0YXRlJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUmVhY3QgUm91dGVyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlYWN0LXJvdXRlcicpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAncmVhY3Qtcm91dGVyJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQW55IGxpYnJhcnkgdGhhdCBtaWdodCB1c2UgUmVhY3Qgc2hvdWxkIGdvIHdpdGggUmVhY3QgZGVwZW5kZW5jaWVzXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3VzZS1zeW5jLWV4dGVybmFsLXN0b3JlJykgfHwgXG4gICAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ3NjaGVkdWxlcicpIHx8XG4gICAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ3JlYWN0LWlzJykgfHxcbiAgICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnaG9pc3Qtbm9uLXJlYWN0LXN0YXRpY3MnKSB8fFxuICAgICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdwcm9wLXR5cGVzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdyZWFjdC1jb3JlJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQWxsIEFudCBEZXNpZ24gY29tcG9uZW50cyBuZWVkIFJlYWN0IGFuZCBoYXZlIGludGVyZGVwZW5kZW5jaWVzXG4gICAgICAgICAgICAvLyBNb3ZlIHRoZW0gYWxsIHRvIHJlYWN0LWNvcmUgdG8gYXZvaWQgaW5pdGlhbGl6YXRpb24gaXNzdWVzXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2FudGQnKSB8fCBpZC5pbmNsdWRlcygnQGFudC1kZXNpZ24nKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ3JlYWN0LWNvcmUnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBSb3V0ZXJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVhY3Qtcm91dGVyJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdyb3V0ZXInO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUERGIGFuZCBDYW52YXMgdXRpbGl0aWVzXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2pzcGRmJykgfHwgaWQuaW5jbHVkZXMoJ2h0bWwyY2FudmFzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdwZGYtdXRpbHMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRGF0ZSB1dGlsaXRpZXNcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnZGF5anMnKSB8fCBpZC5pbmNsdWRlcygnbW9tZW50JykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdkYXRlLXV0aWxzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEltYWdlIHByb2Nlc3NpbmdcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVhY3QtaW1hZ2UtY3JvcCcpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnaW1hZ2UtdXRpbHMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWNvbnNcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQGFudC1kZXNpZ24vaWNvbnMnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2FudGQtaWNvbnMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUkMgY29tcG9uZW50cyAoQW50IERlc2lnbiBkZXBlbmRlbmNpZXMpIC0gbmVlZCBSZWFjdCwgbW92ZSB0byByZWFjdC1jb3JlXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JjLScpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAncmVhY3QtY29yZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBPdGhlciBsYXJnZSBsaWJyYXJpZXNcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbG9kYXNoJykgfHwgaWQuaW5jbHVkZXMoJ3JhbWRhJykgfHwgXG4gICAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ2NsYXNzbmFtZXMnKSB8fCBpZC5pbmNsdWRlcygnY2xzeCcpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAndXRpbGl0eS1saWJzJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQW55IGxpYnJhcnkgdGhhdCBtaWdodCB1c2UgUmVhY3Qgc2hvdWxkIGdvIHdpdGggUmVhY3QgZGVwZW5kZW5jaWVzXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3VzZS1zeW5jLWV4dGVybmFsLXN0b3JlJykgfHwgXG4gICAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ3NjaGVkdWxlcicpIHx8XG4gICAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ3JlYWN0LWlzJykgfHxcbiAgICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnaG9pc3Qtbm9uLXJlYWN0LXN0YXRpY3MnKSB8fFxuICAgICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdwcm9wLXR5cGVzJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdyZWFjdC1jb3JlJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gRG9uJ3QgbWFudWFsbHkgY2h1bmsgcmVtYWluaW5nIGxpYnJhcmllcyAtIGxldCBWaXRlIGF1dG8tY2h1bmsgdGhlbVxuICAgICAgICAgICAgLy8gVGhpcyBwcmV2ZW50cyBSZWFjdCBkZXBlbmRlbmN5IGlzc3Vlc1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gQXBwIGNvZGUgY2h1bmtpbmdcbiAgICAgICAgICAvLyBQT1MgcmVsYXRlZCBjb21wb25lbnRzXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvUE9TLycpIHx8IGlkLmluY2x1ZGVzKCcvQ2FydCcpIHx8IGlkLmluY2x1ZGVzKCcvQ2hlY2tvdXQnKSkge1xuICAgICAgICAgICAgcmV0dXJuICdwb3MtY29tcG9uZW50cyc7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFByb2R1Y3QgbWFuYWdlbWVudFxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL1Byb2R1Y3RzLycpIHx8IGlkLmluY2x1ZGVzKCcvQ2F0ZWdvcmllcy8nKSkge1xuICAgICAgICAgICAgcmV0dXJuICdwcm9kdWN0LWNvbXBvbmVudHMnO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBQdXJjaGFzZSBvcmRlcnNcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9QdXJjaGFzZU9yZGVycy8nKSkge1xuICAgICAgICAgICAgcmV0dXJuICdwdXJjaGFzZS1jb21wb25lbnRzJztcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUmVwb3J0cyBhbmQgYW5hbHl0aWNzXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvUmVwb3J0cy8nKSB8fCBpZC5pbmNsdWRlcygnL0FuYWx5dGljcy8nKSkge1xuICAgICAgICAgICAgcmV0dXJuICdyZXBvcnQtY29tcG9uZW50cyc7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFNldHRpbmdzIGFuZCBjb25maWd1cmF0aW9uXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvU2V0dGluZ3MvJykgfHwgaWQuaW5jbHVkZXMoJy9Vc2Vycy8nKSkge1xuICAgICAgICAgICAgcmV0dXJuICdhZG1pbi1jb21wb25lbnRzJztcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gQ29tbW9uIGNvbXBvbmVudHNcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9jb21tb24vJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnY29tbW9uLWNvbXBvbmVudHMnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEyMDAsIC8vIEluY3JlYXNlZCBkdWUgdG8gUmVhY3QrQW50ZCBiZWluZyBidW5kbGVkIHRvZ2V0aGVyXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDEsXG4gICAgb3BlbjogdHJ1ZSxcbiAgICBjb3JzOiB0cnVlLFxuICAgIGhvc3Q6IHRydWUsXG4gIH0sXG4gIHByZXZpZXc6IHtcbiAgICBwb3J0OiAzMDAxLFxuICAgIG9wZW46IHRydWUsXG4gICAgY29yczogdHJ1ZSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogW1xuICAgICAgJ3JlYWN0JywgXG4gICAgICAncmVhY3QtZG9tJyxcbiAgICAgICdyZWFjdC9qc3gtcnVudGltZScsXG4gICAgICAncmVhY3Qtcm91dGVyLWRvbScsXG4gICAgICAnQHJlZHV4anMvdG9vbGtpdCcsXG4gICAgICAncmVhY3QtcmVkdXgnLFxuICAgICAgJ2FudGQnLFxuICAgICAgJ2RheWpzJ1xuICAgIF0sXG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICBmb3JjZTogdHJ1ZSwgLy8gRm9yY2UgcmUtb3B0aW1pemF0aW9uXG4gIH0sXG4gIGVzYnVpbGQ6IHtcbiAgICBsb2dPdmVycmlkZTogeyAndGhpcy1pcy11bmRlZmluZWQtaW4tZXNtJzogJ3NpbGVudCcgfVxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFGakIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBO0FBQUEsTUFFSixTQUFTO0FBQUEsTUFDVCxZQUFZO0FBQUEsSUFDZCxDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsVUFBVSxDQUFDLFFBQVE7QUFFakIsZUFBTztBQUFBLE1BQ1Q7QUFBQSxNQUNBLFFBQVE7QUFBQTtBQUFBLFFBRU4sZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsY0FBYyxDQUFDLE9BQU87QUFFcEIsY0FBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBRS9CLGdCQUFJLEdBQUcsU0FBUyxPQUFPLEtBQUssR0FBRyxTQUFTLFdBQVcsR0FBRztBQUNwRCxxQkFBTztBQUFBLFlBQ1Q7QUFHQSxnQkFBSSxHQUFHLFNBQVMsa0JBQWtCLEtBQUssR0FBRyxTQUFTLGFBQWEsS0FDNUQsR0FBRyxTQUFTLFlBQVksS0FBSyxHQUFHLFNBQVMsY0FBYyxLQUFLLEdBQUcsU0FBUyxVQUFVLEdBQUc7QUFDdkYscUJBQU87QUFBQSxZQUNUO0FBR0EsZ0JBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUMvQixxQkFBTztBQUFBLFlBQ1Q7QUFHQSxnQkFBSSxHQUFHLFNBQVMseUJBQXlCLEtBQ3JDLEdBQUcsU0FBUyxXQUFXLEtBQ3ZCLEdBQUcsU0FBUyxVQUFVLEtBQ3RCLEdBQUcsU0FBUyx5QkFBeUIsS0FDckMsR0FBRyxTQUFTLFlBQVksR0FBRztBQUM3QixxQkFBTztBQUFBLFlBQ1Q7QUFJQSxnQkFBSSxHQUFHLFNBQVMsTUFBTSxLQUFLLEdBQUcsU0FBUyxhQUFhLEdBQUc7QUFDckQscUJBQU87QUFBQSxZQUNUO0FBR0EsZ0JBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUMvQixxQkFBTztBQUFBLFlBQ1Q7QUFFQSxnQkFBSSxHQUFHLFNBQVMsT0FBTyxLQUFLLEdBQUcsU0FBUyxhQUFhLEdBQUc7QUFDdEQscUJBQU87QUFBQSxZQUNUO0FBRUEsZ0JBQUksR0FBRyxTQUFTLE9BQU8sS0FBSyxHQUFHLFNBQVMsUUFBUSxHQUFHO0FBQ2pELHFCQUFPO0FBQUEsWUFDVDtBQUVBLGdCQUFJLEdBQUcsU0FBUyxrQkFBa0IsR0FBRztBQUNuQyxxQkFBTztBQUFBLFlBQ1Q7QUFFQSxnQkFBSSxHQUFHLFNBQVMsbUJBQW1CLEdBQUc7QUFDcEMscUJBQU87QUFBQSxZQUNUO0FBRUEsZ0JBQUksR0FBRyxTQUFTLEtBQUssR0FBRztBQUN0QixxQkFBTztBQUFBLFlBQ1Q7QUFFQSxnQkFBSSxHQUFHLFNBQVMsUUFBUSxLQUFLLEdBQUcsU0FBUyxPQUFPLEtBQzVDLEdBQUcsU0FBUyxZQUFZLEtBQUssR0FBRyxTQUFTLE1BQU0sR0FBRztBQUNwRCxxQkFBTztBQUFBLFlBQ1Q7QUFHQSxnQkFBSSxHQUFHLFNBQVMseUJBQXlCLEtBQ3JDLEdBQUcsU0FBUyxXQUFXLEtBQ3ZCLEdBQUcsU0FBUyxVQUFVLEtBQ3RCLEdBQUcsU0FBUyx5QkFBeUIsS0FDckMsR0FBRyxTQUFTLFlBQVksR0FBRztBQUM3QixxQkFBTztBQUFBLFlBQ1Q7QUFJQSxtQkFBTztBQUFBLFVBQ1Q7QUFJQSxjQUFJLEdBQUcsU0FBUyxPQUFPLEtBQUssR0FBRyxTQUFTLE9BQU8sS0FBSyxHQUFHLFNBQVMsV0FBVyxHQUFHO0FBQzVFLG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksR0FBRyxTQUFTLFlBQVksS0FBSyxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQzVELG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksR0FBRyxTQUFTLGtCQUFrQixHQUFHO0FBQ25DLG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksR0FBRyxTQUFTLFdBQVcsS0FBSyxHQUFHLFNBQVMsYUFBYSxHQUFHO0FBQzFELG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksR0FBRyxTQUFTLFlBQVksS0FBSyxHQUFHLFNBQVMsU0FBUyxHQUFHO0FBQ3ZELG1CQUFPO0FBQUEsVUFDVDtBQUVBLGNBQUksR0FBRyxTQUFTLFVBQVUsR0FBRztBQUMzQixtQkFBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLHVCQUF1QjtBQUFBO0FBQUEsRUFDekI7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUyxDQUFDLGNBQWM7QUFBQSxJQUN4QixPQUFPO0FBQUE7QUFBQSxFQUNUO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxhQUFhLEVBQUUsNEJBQTRCLFNBQVM7QUFBQSxFQUN0RDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
