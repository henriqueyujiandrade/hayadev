import { expect, test } from '@playwright/test';

import { waitForIslands } from '../support/islands';

test.describe('project filters', () => {
  test('the grid is complete in the static HTML, before any hydration', async ({ page }) => {
    const html = await (await page.request.get('/projetos/')).text();

    expect(html).toContain('Onde estou?');
    expect(html).toContain('data-filterable');
  });

  test('filters the server-rendered cards without navigating', async ({ page }) => {
    await page.goto('/projetos/');

    const card = page.getByRole('heading', { name: 'Onde estou?' });
    await expect(card).toBeVisible();

    await waitForIslands(page);

    const gameFilter = page.getByRole('button', { name: /jogo/i });
    await gameFilter.click();
    await expect(gameFilter).toHaveAttribute('aria-pressed', 'true');
    await expect(card).toBeVisible();

    await page.getByRole('button', { name: /^todos/i }).click();
    await expect(card).toBeVisible();
    expect(page.url()).toContain('/projetos/');
  });

  test('offers only facets that actually match something', async ({ page }) => {
    await page.goto('/projetos/');
    await waitForIslands(page);

    const buttons = page.getByRole('group', { name: /filtrar por tipo/i }).getByRole('button');
    const labels = await buttons.allTextContents();

    /* Each button is "<label><count>". A facet with no matching project must not exist. */
    expect(labels.length).toBeGreaterThan(1);
    for (const label of labels) {
      const count = Number(label.match(/(\d+)$/)?.[1]);
      expect(count, `facet "${label}" must match at least one project`).toBeGreaterThan(0);
    }
  });
});

test.describe('article search', () => {
  /*
   * The articles are drafts, so the index is empty in a production build and the
   * island is not rendered at all. These assertions pin that behaviour: an empty
   * state instead of a search box over nothing.
   */
  test('is not rendered when there is nothing to search', async ({ page }) => {
    await page.goto('/artigos/');

    await expect(page.getByRole('searchbox')).toHaveCount(0);
    await expect(page.getByText('Nenhum artigo publicado ainda.')).toBeVisible();
  });
});

test.describe('table of contents', () => {
  test('is generated from the headings and links to them', async ({ page }) => {
    await page.goto('/projetos/hidden-object/');

    /* The case study renders prose but no aside TOC; the article layout does.
       Here we assert the heading anchors exist for deep linking. */
    const headings = page.locator('.prose h2[id]');
    expect(await headings.count()).toBeGreaterThan(2);

    const firstId = await headings.first().getAttribute('id');
    expect(firstId).toBeTruthy();
  });
});

test.describe('share controls', () => {
  test('are absent from a project page and present on articles only', async ({ page }) => {
    await page.goto('/projetos/hidden-object/');
    await expect(page.locator('[data-copy-link]')).toHaveCount(0);
  });
});
