import { defineConfig, devices } from '@playwright/test';

const entorno = process.env.E2E_TARGET ?? 'prod';

const baseURL =
  entorno === 'local'
    ? 'http://127.0.0.1:4173'
    : 'https://www.desaprendiendo.net';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    baseURL,
    trace: 'on-first-retry',
  },

webServer:
      entorno === 'local'
      ? {
          command: 'npm run serve:portfolio',
          url: 'http://127.0.0.1:4173',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        }
      : undefined,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
