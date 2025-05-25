import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@KentNabiz/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@KentNabiz/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
});
