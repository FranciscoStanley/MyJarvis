import { createNestVitestConfig } from '@myjarvis/nest-vitest';

export default createNestVitestConfig({
  test: {
    include: ['test/integration/**/*.spec.ts'],
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
});
