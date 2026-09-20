import { defineConfig, devices } from '@playwright/test';

import { DEV_URL, PREVIEW_URL } from './tests/e2e/constants';

/**
 * Two kinds of run:
 *
 * - `desktop` / `mobile` test the production build served by `astro preview`.
 *   Draft filtering, the sitemap, the feeds and the CSP only behave correctly
 *   in a real build, so those assertions belong here. The preview server is
 *   started in `global-setup.ts`, because Astro 7's preview command manages its
 *   own background process and returns immediately, which `webServer` cannot
 *   drive.
 *
 * - `content` tests the dev server, where drafts are visible. Every article is
 *   currently a draft, so this is the only place the article pages and the
 *   search island can be exercised. Without it, that whole pipeline would have
 *   no coverage until the first article is published.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',

  use: { trace: 'on-first-retry' },

  projects: [
    {
      name: 'desktop',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'], baseURL: PREVIEW_URL },
    },
    {
      name: 'mobile',
      testDir: './tests/e2e',
      use: { ...devices['Pixel 7'], baseURL: PREVIEW_URL },
    },
    {
      name: 'content',
      testDir: './tests/content',
      use: { ...devices['Desktop Chrome'], baseURL: DEV_URL },
    },
  ],
});
