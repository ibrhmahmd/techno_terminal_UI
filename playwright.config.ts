import { defineConfig, devices } from '@playwright/test'
import { apiTarget } from './e2e/support/env'

// Throws before anything starts unless E2E_API_TARGET is the staging API.
const target = apiTarget()
const PORT = 5179

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  workers: 3,
  retries: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'en-US',
    timezoneId: 'Africa/Cairo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    { name: 'sweep', testMatch: /sweep\.setup\.ts/, dependencies: ['setup'], use: { ...devices['Desktop Chrome'] } },
    {
      name: 'desktop',
      testMatch: /specs\/.*\.spec\.ts/,
      testIgnore: /mobile\.spec\.ts/,
      dependencies: ['sweep'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      testMatch: /specs\/.*mobile\.spec\.ts/,
      dependencies: ['sweep'],
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: `npx vite --config vite.e2e.config.ts --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    // Never reuse a running `npm run dev`: that one proxies to production.
    reuseExistingServer: false,
    env: { E2E_API_TARGET: target },
  },
})
