import { defineConfig, devices } from '@playwright/test';

const webURL = process.env.COVERAGE_BASE_URL ?? 'http://127.0.0.1:4174';
const apiURL = process.env.API_BASE_URL ?? 'http://127.0.0.1:3001';

export default defineConfig({
  testDir: '.',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  globalTeardown: './support/globalTeardownCoverage.ts',

  reporter: [
    ['html'],
    ['list'],
  ],

  use: {
    baseURL: webURL,
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : undefined,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  webServer: [
    {
      command: 'npm run serve:portfolio:coverage',
      url: webURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run serve:api:coverage',
      url: `${apiURL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
