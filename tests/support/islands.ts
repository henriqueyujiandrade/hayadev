import { expect, type Page } from '@playwright/test';

/**
 * Waits until every island on the page has hydrated.
 *
 * Islands declared `client:idle` hydrate on `requestIdleCallback`, which can
 * fire well after `networkidle`. Interacting before then hits inert
 * server-rendered markup, and the test fails for a reason that has nothing to
 * do with the code. Astro drops the `ssr` attribute from `<astro-island>` once
 * the framework takes over, so its absence is an exact signal rather than a
 * guessed timeout.
 */
export async function waitForIslands(page: Page): Promise<void> {
  await page.waitForFunction(() => document.querySelectorAll('astro-island[ssr]').length === 0);
}

/**
 * Asserts exactly how many list items are on screen.
 *
 * Counting what is visible is deliberate: `toBeHidden()` also passes when an
 * element does not exist at all, so a mistyped selector would make a filtering
 * test pass while proving nothing.
 */
export async function expectVisibleCount(page: Page, count: number): Promise<void> {
  await expect(page.locator('[data-filterable]:not([hidden])')).toHaveCount(count);
}
