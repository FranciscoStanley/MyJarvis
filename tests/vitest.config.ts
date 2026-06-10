import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['helpers/**/*.spec.ts'],
    testTimeout: 10000,
  },
});
