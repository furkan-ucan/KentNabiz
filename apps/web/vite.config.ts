import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  css: {
    postcss: './postcss.config.mjs',
  },
  assetsInclude: ['**/*.geojson'], // GeoJSON dosyalarını asset olarak dahil et
  resolve: {
    alias: {
      '@kentnabiz/shared': path.resolve(
        __dirname,
        '../../packages/shared/dist/index.mjs'
      ),
    },
  },
  build: {
    // Performance optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@mui/system'],
          charts: ['recharts'],
          maps: ['leaflet', 'react-leaflet'],
          query: ['@tanstack/react-query'],
          router: ['react-router-dom'],
          forms: ['formik', 'yup', 'react-hook-form'],
          supervisor: ['@mui/x-data-grid'],
          // Ana chunk'ları böl
          utils: ['lodash', 'date-fns', 'axios'],
          animation: ['framer-motion', 'lottie-react'],
          icons: ['lucide-react', 'react-icons'],
        },
      },
    },
    // Enable source maps for better debugging but smaller production bundles
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Minify for better performance
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
