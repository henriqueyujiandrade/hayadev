import { expect, test } from '@playwright/test';

import { ALL_PAGES, DRAFT_SLUGS, PAGES, collectPageErrors } from './helpers';

test.describe('routes', () => {
  for (const path of ALL_PAGES) {
    test(`${path} responds and renders its heading`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).not.toBeEmpty();
    });
  }

  test('every page declares the language of its own locale', async ({ page }) => {
    const expectations: Array<[string, string]> = [
      [PAGES['pt-BR'][0], 'pt-BR'],
      [PAGES.en[0], 'en'],
      [PAGES.es[0], 'es'],
      [PAGES['pt-BR'][5], 'pt-BR'],
      [PAGES.es[5], 'es'],
    ];

    for (const [path, lang] of expectations) {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
    }
  });

  test('renders without console or page errors, including CSP violations', async ({ page }) => {
    for (const path of ['/', '/projetos/hidden-object/', '/artigos/', '/en/', '/es/sobre/', '/contato/']) {
      const errors = collectPageErrors(page);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      expect(errors, `errors on ${path}`).toEqual([]);
    }
  });

  test('drafts have no route in a production build', async ({ page }) => {
    for (const slug of DRAFT_SLUGS) {
      for (const path of [`/artigos/${slug}/`, `/en/articles/${slug}/`, `/es/articulos/${slug}/`]) {
        const response = await page.goto(path);
        expect(response?.status(), `${path} must not exist`).toBe(404);
      }
    }
  });

  test('answers a missing localized path in that language', async ({ page }) => {
    /*
     * A static deployment serves one 404.html for the whole site, so the page
     * adapts to the prefix of the path that was missed.
     */
    const cases: Array<[string, string, string, string]> = [
      ['/en/nope/', 'en', 'This page does not exist', '/en/'],
      ['/es/nope/', 'es', 'Esta página no existe', '/es/'],
      ['/nope/', 'pt-BR', 'Esta página não existe', '/'],
    ];

    for (const [path, lang, heading, home] of cases) {
      const errors = collectPageErrors(page);
      await page.goto(path);

      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('h1')).toHaveText(heading);
      await expect(page.locator('main a').first()).toHaveAttribute('href', home);

      /* Notably: no Content-Security-Policy violation from the adaptation. */
      expect(errors.filter((error) => !error.includes('status of 404'))).toEqual([]);
    }
  });

  test('serves a 404 page that offers a way back', async ({ page }) => {
    await page.goto('/this-page-does-not-exist/');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.getByRole('link', { name: /início|home/i }).first()).toBeVisible();
  });
});
