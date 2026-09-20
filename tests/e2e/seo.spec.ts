import { expect, test } from '@playwright/test';

import { ALL_PAGES, headAttribute } from './helpers';

const ORIGIN = 'https://hayadev.dev';

test.describe('SEO metadata', () => {
  for (const path of ALL_PAGES) {
    test(`${path} carries a complete, self-referencing head`, async ({ page }) => {
      await page.goto(path);

      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);
      expect(title).not.toContain('undefined');

      const description = await headAttribute(page, 'meta[name="description"]');
      expect(description, 'description').toBeTruthy();
      expect(description!.length).toBeGreaterThan(50);

      /* The canonical must point at this page, not at the default language. */
      const canonical = await headAttribute(page, 'link[rel="canonical"]', 'href');
      expect(canonical).toBe(`${ORIGIN}${path}`);

      for (const property of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type']) {
        const value = await headAttribute(page, `meta[property="${property}"]`);
        expect(value, property).toBeTruthy();
        expect(value, property).not.toContain('undefined');
      }

      const ogImage = await headAttribute(page, 'meta[property="og:image"]');
      expect(ogImage).toMatch(/^https:\/\//);

      expect(await headAttribute(page, 'meta[name="twitter:card"]')).toBe('summary_large_image');
      expect(await headAttribute(page, 'meta[name="robots"]')).toContain('index');
    });
  }

  test('hreflang links the three translations of the same page', async ({ page }) => {
    const groups = [
      ['/', '/en/', '/es/'],
      ['/projetos/', '/en/projects/', '/es/proyectos/'],
      ['/artigos/', '/en/articles/', '/es/articulos/'],
      ['/sobre/', '/en/about/', '/es/sobre/'],
      ['/projetos/hidden-object/', '/en/projects/hidden-object/', '/es/proyectos/hidden-object/'],
    ];

    for (const group of groups) {
      const expected = new Set(group.map((path) => `${ORIGIN}${path}`));

      for (const path of group) {
        await page.goto(path);

        const hrefs = await page
          .locator('link[rel="alternate"][hreflang]:not([hreflang="x-default"])')
          .evaluateAll((links) => links.map((link) => link.getAttribute('href')));

        expect(new Set(hrefs), `alternates on ${path}`).toEqual(expected);

        /* x-default points at the Portuguese version, the canonical language. */
        const xDefault = await page
          .locator('link[rel="alternate"][hreflang="x-default"]')
          .getAttribute('href');
        expect(xDefault).toBe(`${ORIGIN}${group[0]}`);
      }
    }
  });

  test('publishes valid structured data referencing one Person entity', async ({ page }) => {
    await page.goto('/');

    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw ?? '{}');

    expect(data['@context']).toBe('https://schema.org');
    const types = data['@graph'].map((node: { '@type': string }) => node['@type']);
    expect(types).toContain('Person');
    expect(types).toContain('WebSite');

    const person = data['@graph'].find((node: { '@type': string }) => node['@type'] === 'Person');
    expect(person.name).toBeTruthy();
    expect(person.jobTitle).toBeTruthy();
    /* The skills mirror the visible stack, and related ones stay explicit entries. */
    expect(person.knowsAbout).toEqual(expect.arrayContaining(['Node.js', 'NestJS', 'PostgreSQL']));
    /* sameAs is omitted entirely while no profile URL is configured. */
    if ('sameAs' in person) expect(person.sameAs.length).toBeGreaterThan(0);
  });

  test('a project page describes itself and its breadcrumb trail', async ({ page }) => {
    await page.goto('/projetos/hidden-object/');

    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const types = JSON.parse(raw ?? '{}')['@graph'].map(
      (node: { '@type': string }) => node['@type'],
    );

    expect(types).toContain('VideoGame');
    expect(types).toContain('BreadcrumbList');
    await expect(page.getByRole('navigation', { name: /trilha|breadcrumb|ruta/i })).toBeVisible();
  });

  test('every page advertises its own RSS feed', async ({ page }) => {
    const cases: Array<[string, string]> = [
      ['/', `${ORIGIN}/feed.xml`],
      ['/en/', `${ORIGIN}/en/feed.xml`],
      ['/es/', `${ORIGIN}/es/feed.xml`],
    ];

    for (const [path, feed] of cases) {
      await page.goto(path);
      await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute('href', feed);
    }
  });
});
