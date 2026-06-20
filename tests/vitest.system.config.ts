import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['system/**/*.spec.ts'],
    testTimeout: 240000,
    hookTimeout: 60000,
  },
});
