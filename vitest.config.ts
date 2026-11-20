import { defineConfig } from 'vitest/config';

// Unit tests for pure modules (`src/**/lib`, `src/schemas`, `src/lib`). No database, no server runtime.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
