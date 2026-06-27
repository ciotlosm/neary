import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{ts,js}'],
    exclude: ['legacy/**', 'apps/legacy/**', 'node_modules/**', 'dist/**'],
  },
});
