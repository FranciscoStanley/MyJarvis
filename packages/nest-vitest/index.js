import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export function createNestVitestConfig(overrides = {}) {
  return defineConfig({
    test: {
      globals: true,
      environment: 'node',
      setupFiles: ['@myjarvis/nest-vitest/setup'],
    },
    plugins: [
      swc.vite({
        jsc: {
          parser: { syntax: 'typescript', decorators: true },
          transform: { legacyDecorator: true, decoratorMetadata: true },
          target: 'es2022',
        },
      }),
    ],
    ...overrides,
  });
}

export default createNestVitestConfig();
