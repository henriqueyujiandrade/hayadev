import { expect, test } from '@playwright/test';

import { DRAFT_SLUGS } from './helpers';

test.describe('generated files', () => {
  test('robots.txt allows crawling and points at the sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain('User-agent: *');
    expect(body).toContain('Allow: /');
    expect(body).toContain('Sitemap: https://hayadev.dev/sitemap-index.xml');
    /* Assets must stay crawlable for Google to render and assess the pages. */
    expect(body).not.toMatch(/Disallow:\s*\/(_astro|\.css|\.js)/);
  });

  test('the sitemap lists every public page and nothing else', async ({ request }) => {
    const index = await request.get('/sitemap-index.xml');
    expect(index.status()).toBe(200);

    const sitemapUrl = (await index.text()).match(/<loc>([^<]+)<\/loc>/)?.[1];
    expect(sitemapUrl).toBeTruthy();

    const body = await (await request.get(new URL(sitemapUrl!).pathname)).text();
    const urls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((match) => match[1])
      .filter((url): url is string => url !== undefined);

    for (const path of ['/', '/projetos/', '/artigos/', '/en/', '/es/proyectos/hidden-object/']) {
      expect(urls, `sitemap must list ${path}`).toContain(`https://hayadev.dev${path}`);
    }

    /* Error pages and drafts must never be advertised for indexing. */
    expect(urls.some((url) => url.includes('/404'))).toBe(false);
    for (const slug of DRAFT_SLUGS) {
      expect(
        urls.some((url) => url.includes(slug)),
        `sitemap leaks draft ${slug}`,
      ).toBe(false);
    }

    /* Every entry keeps the site's trailing-slash convention. */
    for (const url of urls) expect(url.endsWith('/')).toBe(true);
  });

  test('each locale has a valid feed carrying only its own language', async ({ request }) => {
    const feeds: Array<[string, string]> = [
      ['/feed.xml', 'pt-BR'],
      ['/en/feed.xml', 'en'],
      ['/es/feed.xml', 'es'],
    ];

    for (const [path, language] of feeds) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(response.headers()['content-type']).toContain('xml');

      const body = await response.text();
      expect(body).toContain('<rss version="2.0">');
      expect(body).toContain(`<language>${language}</language>`);

      for (const slug of DRAFT_SLUGS) {
        expect(body.includes(slug), `${path} leaks draft ${slug}`).toBe(false);
      }
    }
  });

  test('the web manifest is served with the right type', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.status()).toBe(200);

    const manifest = JSON.parse(await response.text());
    expect(manifest.name).toContain('HayaDev');
    expect(manifest.icons.length).toBeGreaterThan(0);
  });
});

test.describe('content rendering', () => {
  test('the hero spells the full name with the brand initials highlighted', async ({ page }) => {
    await page.goto('/');

    const heading = page.locator('h1');
    /* Plain inline spans: the heading must still read as one name. */
    await expect(heading).toHaveText('Henrique Augusto Yuji de Andrade');
    await expect(heading.locator('span.text-accent')).toHaveText(['H', 'A', 'Y', 'A']);
  });

  test('the hero leads with the professional identity and keeps the games line apart', async ({
    page,
  }) => {
    await page.goto('/');

    const hero = page.locator('section').first();
    /* Related skills are spelled out one by one, not folded into a framework name. */
    await expect(hero).toContainText(
      'Python, Django, Django REST Framework, Node.js, NestJS, TypeScript, PostgreSQL',
    );
    /* The unusual part of the profile is its own line, after the technology chips. */
    await expect(hero.getByText('Também desenvolvo jogos 2D')).toBeVisible();
  });

  test('the project case study is fully present in the static HTML', async ({ page }) => {
    /* Content must not depend on JavaScript: assert against the raw response. */
    const response = await page.request.get('/projetos/hidden-object/');
    const html = await response.text();

    expect(html).toContain('Onde estou?');
    expect(html).toContain('perspectiva');
    expect(html).toContain('<h2');
    expect(html).toContain('astro-code');
  });

  test('code blocks carry both theme palettes for a CSS-only theme switch', async ({ page }) => {
    await page.goto('/projetos/hidden-object/');

    const code = page.locator('pre.astro-code').first();
    await expect(code).toBeVisible();

    const style = await code.getAttribute('style');
    expect(style).toContain('--shiki-light');
    expect(style).toContain('--shiki-dark');
  });

  test('a project without a live or repository URL renders no dead buttons', async ({ page }) => {
    await page.goto('/projetos/hidden-object/');

    await expect(page.getByRole('link', { name: /jogar|play/i })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /código-fonte|source code/i })).toHaveCount(0);
  });

  test('the empty articles index explains itself instead of showing a placeholder', async ({
    page,
  }) => {
    await page.goto('/artigos/');

    await expect(page.getByText('Nenhum artigo publicado ainda.')).toBeVisible();
    const body = (await page.textContent('body')) ?? '';
    for (const placeholder of ['Lorem ipsum', 'TODO', 'Coming soon', 'Your Name', 'undefined']) {
      expect(body, `placeholder "${placeholder}" must not be published`).not.toContain(placeholder);
    }
  });
});
