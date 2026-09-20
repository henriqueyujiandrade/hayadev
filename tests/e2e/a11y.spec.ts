import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { ALL_PAGES } from './helpers';

/**
 * Automated accessibility checks.
 *
 * These catch the mechanical failures — contrast, names, roles, landmarks,
 * heading order. They are a floor, not a ceiling: keyboard operation of the
 * menu, the theme toggle and the skip link is asserted separately in
 * navigation.spec.ts, because no scanner can verify those.
 */
const RULESET = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('accessibility', () => {
  for (const path of ALL_PAGES) {
    test(`${path} has no detectable WCAG violations`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      const { violations } = await new AxeBuilder({ page }).withTags(RULESET).analyze();

      expect(violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
    });
  }

  test('passes in dark mode as well as light', async ({ page }) => {
    for (const colorScheme of ['dark', 'light'] as const) {
      await page.emulateMedia({ colorScheme });
      await page.goto('/projetos/hidden-object/');
      await page.waitForLoadState('networkidle');

      const { violations } = await new AxeBuilder({ page }).withTags(RULESET).analyze();
      expect(
        violations.map((violation) => violation.id),
        colorScheme,
      ).toEqual([]);
    }
  });

  test('the 404 page is accessible too', async ({ page }) => {
    await page.goto('/nope/');
    const { violations } = await new AxeBuilder({ page }).withTags(RULESET).analyze();
    expect(violations.map((violation) => violation.id)).toEqual([]);
  });

  test('exposes one main landmark and a single h1 per page', async ({ page }) => {
    for (const path of ['/', '/projetos/', '/sobre/', '/en/articles/']) {
      await page.goto(path);
      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveCount(1);
    }
  });

  test('honours prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const behaviour = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(behaviour).toBe('auto');
  });
});
