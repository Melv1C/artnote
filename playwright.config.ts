import { defineConfig, devices } from '@playwright/test';
import { e2eEnv } from './scripts/e2e-env';
import { loadEnvFiles } from './scripts/env-files';

loadEnvFiles();

// A database and port of its own, recreated on every run: tests may write freely
const env = e2eEnv(process.env);

export default defineConfig({
  testDir: 'e2e',
  // One worker: the tests share the seeded database and the dev server compiles pages on first visit
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 60_000,
  use: {
    baseURL: env.BASE_URL,
    locale: 'fr-BE',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'vpx scripts/e2e-database.ts && vp dev',
    url: env.BASE_URL,
    env,
    // Never reuse a server: it would run on data this run did not seed
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
