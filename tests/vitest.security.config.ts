import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['security/**/*.spec.ts'],
    testTimeout: 60000,
    hookTimeout: 30000,
  },
});
