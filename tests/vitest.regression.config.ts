import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['regression/**/*.spec.ts'],
    testTimeout: 360000,
    hookTimeout: 60000,
  },
});
