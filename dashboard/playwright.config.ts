import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — quinn's release gate.
 * "Agents say done; browsers tell the truth."
 * Chromium-only scope (2026-08-01): the dashboard is internal/BOD-gated and the
 * scraping stack (Crawl4AI/browser-use/ScrapeGraphAI) also drives Chromium, so
 * one engine does double duty. Re-enable firefox/webkit below if a public,
 * cross-browser surface ships. Install: `npx playwright install chromium`.
 * Boots the Next.js dev server, runs critical-flow E2E in tests/e2e/.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Auth setup (2026-08-24): the dashboard is SessionGate-protected; a fresh
    // browser bounces to /login. This project signs in once (E2E_USERNAME /
    // E2E_PASSWORD env) or reuses tests/e2e/.auth/user.json, and the chromium
    // project depends on it. See tests/e2e/auth.setup.ts.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'tests/e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
    // Cross-browser — re-enable + `npx playwright install firefox webkit` when a public surface ships:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
