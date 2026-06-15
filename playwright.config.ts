/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

const entorno = process.env.E2E_TARGET ?? 'prod';

const webURL =
  entorno === 'local'
    ? 'http://127.0.0.1:4173'
    : 'https://www.desaprendiendo.net';

const apiURL = process.env.API_BASE_URL ?? 'http://127.0.0.1:3001';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html'],
    ['list'],
  ],

  use: {
    baseURL: webURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer:
    entorno === 'local'
      ? [
          {
            command: 'npm run serve:portfolio',
            url: webURL,
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
          },
          {
            command: 'npm run serve:api',
            url: `${apiURL}/health`,
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
          },
        ]
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
