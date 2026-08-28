import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./client/src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./client/src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      include: [
        'client/src/services/**/*.ts',
        'client/src/repositories/**/*.ts',
        'client/src/utils/**/*.ts',
        'client/src/contexts/{AuthContext,WatchlistContext}.tsx',
        'client/src/storage/database.ts',
        'client/src/components/{MarketChart,MarketTable,ProtectedRoute}.tsx',
        'client/src/layouts/DashboardLayout.tsx',
        'client/src/pages/{LoginPage,CreateAccountPage,WatchlistPage}.tsx',
        'client/src/theme/AppThemeProvider.tsx',
      ],
      exclude: [
        'client/src/main.tsx',
        'client/src/test/**',
        'client/src/**/*.d.ts',
      ],
      thresholds: {
        lines: 75,
        branches: 65,
        functions: 70,
        statements: 75,
      },
    },
  },
});
