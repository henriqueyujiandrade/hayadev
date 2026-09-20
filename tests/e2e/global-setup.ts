import { execFileSync } from 'node:child_process';

import { DEV_PORT, DEV_URL, PREVIEW_PORT, PREVIEW_URL } from './constants';

/**
 * Builds the site and starts both servers the suite needs.
 *
 * Astro 7 runs `dev` and `preview` as managed background processes that return
 * immediately, so neither can be driven by Playwright's `webServer` option,
 * which expects a command that stays in the foreground. Starting them here —
 * and stopping them in the teardown — uses Astro's own lifecycle rather than
 * fighting it.
 *
 * - The preview server serves a production build, where draft filtering, the
 *   sitemap, the feeds and the CSP behave as they will in production.
 * - The dev server is where drafts exist, and is therefore the only place the
 *   article pipeline can be tested until the first article is published.
 */
/**
 * `astro dev`/`preview` are expected to daemonize and return in about a
 * second. Nothing downstream bounds these calls — `waitForServer` only starts
 * once they return — so a spawn that never comes back (a hung install, a
 * stalled network call, an environment where the CLI picks foreground mode
 * instead of backgrounding itself) would otherwise block the whole suite
 * forever with no error. Giving each call its own timeout turns that into a
 * fast, attributable failure instead of a silent multi-hour hang.
 */
const SPAWN_TIMEOUT_MS = 120_000;

export default async function globalSetup(): Promise<void> {
  if (process.env.PLAYWRIGHT_SKIP_BUILD !== '1') {
    execFileSync('pnpm', ['build'], {
      stdio: 'inherit',
      env: { ...process.env, CI: '1' },
      timeout: SPAWN_TIMEOUT_MS,
    });
  }

  stopServers();

  execFileSync('pnpm', ['exec', 'astro', 'preview', '--port', String(PREVIEW_PORT)], {
    stdio: 'inherit',
    timeout: SPAWN_TIMEOUT_MS,
  });

  execFileSync('pnpm', ['exec', 'astro', 'dev', '--port', String(DEV_PORT)], {
    stdio: 'inherit',
    /*
     * The dev toolbar injects a shadow DOM that Playwright's selectors pierce,
     * producing strict-mode violations against elements that are not part of
     * the page under test.
     */
    env: { ...process.env, ASTRO_DEV_TOOLBAR: 'off' },
    timeout: SPAWN_TIMEOUT_MS,
  });

  await Promise.all([waitForServer(PREVIEW_URL), waitForServer(DEV_URL)]);
}

/** Clears servers left behind by an interrupted run. */
function stopServers(): void {
  for (const command of ['preview', 'dev']) {
    try {
      execFileSync('pnpm', ['exec', 'astro', command, 'stop'], { stdio: 'ignore' });
    } catch {
      /* Nothing was running. */
    }
  }
}

async function waitForServer(url: string, timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* Not up yet. */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Server did not become ready at ${url} within ${timeoutMs}ms.`);
}
