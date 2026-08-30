import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const isolationHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
};

export default defineConfig({
  root: path.resolve(rootDirectory, 'client'),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDirectory, 'client/src'),
    },
  },
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
  worker: {
    format: 'es',
  },
  server: {
    host: true,
    allowedHosts: true,
    headers: isolationHeaders,
    fs: {
      strict: true,
      allow: [rootDirectory],
    },
  },
  preview: {
    host: true,
    allowedHosts: true,
    headers: isolationHeaders,
  },
  build: {
    outDir: path.resolve(rootDirectory, 'dist/public'),
    emptyOutDir: true,
  },
});
