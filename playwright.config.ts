import { defineConfig } from '@playwright/test'

// Browser tests (npm run test:e2e) against production builds in demo mode: bundled data, and a console password that
// exists only in this test build, which is never deployed:
//   VITE_ADMIN_DEMO_PASSWORD=demo123 npm run build && npm run test:e2e
// Locally they use the installed Chrome; in CI, Playwright's own Chromium (npx playwright install chromium).
const PUBLIC = process.env.E2E_PUBLIC_URL ?? 'http://localhost:4173'
const ADMIN = process.env.E2E_ADMIN_URL ?? 'http://localhost:4174'

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { channel: process.env.CI ? undefined : 'chrome', trace: 'retain-on-failure' },
  projects: [
    { name: 'website', testMatch: /website\.spec\.ts/, use: { baseURL: PUBLIC } },
    { name: 'console', testMatch: /console\.spec\.ts/, use: { baseURL: ADMIN } },
  ],
  webServer: [
    { command: 'npm run preview', url: PUBLIC, reuseExistingServer: !process.env.CI },
    { command: 'npm run preview:admin', url: ADMIN, reuseExistingServer: !process.env.CI },
  ],
})
