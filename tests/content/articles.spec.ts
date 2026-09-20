import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { expectVisibleCount, waitForIslands } from '../support/islands';

/**
 * The article pipeline, exercised against the dev server.
 *
 * Every article is a draft right now, so these pages do not exist in a
 * production build. Testing them here keeps the article layout, the table of
 * contents, the search island and the related-content graph covered, instead
 * of leaving them unverified until the first article is published.
 */
const ARTICLE = '/artigos/perspectiva-2d/';

test.describe('article page', () => {
  test('renders the full document with its metadata', async ({ page }) => {
    await page.goto(ARTICLE);

    await expect(page.locator('h1')).toHaveText('Posicionamento em perspectiva num jogo 2D');
    await expect(page.getByText('10 de setembro de 2026')).toBeVisible();
    await expect(page.getByText('3 min de leitura')).toBeVisible();
    await expect(page.locator('.prose h2').first()).toBeVisible();

    /* Drafts are flagged in development so they cannot be mistaken for live. */
    await expect(page.getByText(/Rascunho/)).toBeVisible();
  });

  test('publishes Article structured data with both dates', async ({ page }) => {
    await page.goto(ARTICLE);

    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const graph = JSON.parse(raw ?? '{}')['@graph'] as Array<Record<string, unknown>>;
    const article = graph.find((node) => node['@type'] === 'Article');

    expect(article).toBeDefined();
    expect(article!.headline).toBe('Posicionamento em perspectiva num jogo 2D');
    expect(article!.datePublished).toContain('2026-09-10');
    expect(article!.dateModified).toBeTruthy();
    expect(article!.author).toEqual({ '@id': 'https://hayadev.dev/#person' });
  });

  test('builds a table of contents from the headings', async ({ page }) => {
    await page.goto(ARTICLE);

    const toc = page.locator('[data-toc]').first();
    const links = toc.locator('[data-toc-link]');
    expect(await links.count()).toBeGreaterThan(2);

    /* Every entry must point at a heading that exists on the page. */
    for (const slug of await links.evaluateAll((items) =>
      items.map((item) => item.getAttribute('data-toc-link')),
    )) {
      await expect(page.locator(`#${slug}`)).toHaveCount(1);
    }
  });

  test('links to the project the article is about', async ({ page }) => {
    await page.goto(ARTICLE);

    const related = page.getByRole('link', { name: 'Onde estou?' });
    await expect(related).toBeVisible();
    await related.click();
    await expect(page).toHaveURL('/projetos/hidden-object/');
  });

  test('offers previous and next in publication order', async ({ page }) => {
    await page.goto('/artigos/regras-de-negocio-http/');

    /* Newer article is "next", older is "previous". */
    await expect(page.locator('a[rel="next"]')).toContainText('perspectiva');
    await expect(page.locator('a[rel="prev"]')).toContainText('Idempotência');
  });

  test('copies its own URL to the clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(ARTICLE);

    await page.locator('[data-copy-link]').click();

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe(`https://hayadev.dev${ARTICLE}`);
  });

  test('has no detectable WCAG violations', async ({ page }) => {
    await page.goto(ARTICLE);
    await page.waitForLoadState('networkidle');

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(violations.map((violation) => violation.id)).toEqual([]);
  });
});

test.describe('article search', () => {
  test('lists every article in the static HTML before hydrating', async ({ page }) => {
    const html = await (await page.request.get('/artigos/')).text();

    expect(html).toContain('Posicionamento em perspectiva');
    expect(html).toContain('Separando regras de negócio');
    expect(html).toContain('Idempotência em endpoints');
  });

  test('filters by free text, ignoring case and accents', async ({ page }) => {
    await page.goto('/artigos/');
    await waitForIslands(page);

    /* No accents and lower case, against a title that has both. */
    await page.getByRole('searchbox').fill('idempotencia');

    await expectVisibleCount(page, 1);
    await expect(page.getByRole('heading', { name: /Idempotência/ })).toBeVisible();
    await expect(page.getByText('1 artigo', { exact: true })).toBeVisible();
  });

  test('filters by category and clears back to everything', async ({ page }) => {
    await page.goto('/artigos/');
    await waitForIslands(page);

    const backend = page.getByRole('button', { name: /^Backend/ });
    await backend.click();
    await expect(backend).toHaveAttribute('aria-pressed', 'true');

    await expectVisibleCount(page, 1);
    await expect(page.getByRole('heading', { name: /regras de negócio/ })).toBeVisible();

    await page.getByRole('button', { name: /Limpar filtros/ }).click();
    await expectVisibleCount(page, 3);
  });

  test('combines the search box with a category', async ({ page }) => {
    await page.goto('/artigos/');
    await waitForIslands(page);

    await page.getByRole('button', { name: /^Backend/ }).click();
    await page.getByRole('searchbox').fill('idempotencia');

    /* The article matches the text but not the category: nothing is left. */
    await expectVisibleCount(page, 0);
  });

  test('reports when nothing matches instead of showing an empty list', async ({ page }) => {
    await page.goto('/artigos/');
    await waitForIslands(page);

    await page.getByRole('searchbox').fill('rust');

    await expectVisibleCount(page, 0);
    await expect(page.getByText('Nenhum artigo corresponde à busca.')).toBeVisible();
  });

  test('offers only categories that have articles', async ({ page }) => {
    await page.goto('/artigos/');
    await waitForIslands(page);

    const labels = await page.getByRole('button').allTextContents();
    expect(labels.join(' ')).not.toContain('Performance');
    expect(labels.join(' ')).not.toContain('Frontend');
  });
});

test.describe('article translations', () => {
  test('switches language without leaving the article', async ({ page }) => {
    await page.goto(ARTICLE);

    await page.getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL('/en/articles/perspectiva-2d/');
    await expect(page.locator('h1')).toHaveText('Perspective placement in a 2D game');

    await page.getByRole('link', { name: 'Español' }).click();
    await expect(page).toHaveURL('/es/articulos/perspectiva-2d/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('formats the publication date for each language', async ({ page }) => {
    await page.goto(ARTICLE);
    await expect(page.getByText('10 de setembro de 2026')).toBeVisible();

    await page.goto('/en/articles/perspectiva-2d/');
    await expect(page.getByText('September 10, 2026')).toBeVisible();

    await page.goto('/es/articulos/perspectiva-2d/');
    await expect(page.getByText('10 de septiembre de 2026')).toBeVisible();
  });
});
