import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['performance/**/*.spec.ts'],
    testTimeout: 60000,
  },
});
