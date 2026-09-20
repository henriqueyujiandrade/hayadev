import { expect, test } from '@playwright/test';

test.describe('language switching', () => {
  test('keeps the visitor on the same page across languages', async ({ page }) => {
    await page.goto('/projetos/hidden-object/');

    await page
      .getByRole('navigation', { name: /trocar de idioma/i })
      .getByRole('link', { name: 'English' })
      .click();
    await expect(page).toHaveURL('/en/projects/hidden-object/');
    await expect(page.locator('h1')).toContainText('Onde estou?');

    await page
      .getByRole('navigation', { name: /change language/i })
      .getByRole('link', { name: 'Español' })
      .click();
    await expect(page).toHaveURL('/es/proyectos/hidden-object/');

    await page
      .getByRole('navigation', { name: /cambiar de idioma/i })
      .getByRole('link', { name: 'Português' })
      .click();
    await expect(page).toHaveURL('/projetos/hidden-object/');
  });

  test('switches section pages to the translated URL segment', async ({ page }) => {
    await page.goto('/artigos/');
    await page.getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL('/en/articles/');

    await page.goto('/sobre/');
    await page.getByRole('link', { name: 'Español' }).click();
    await expect(page).toHaveURL('/es/sobre/');
  });

  test('marks the current language rather than linking to it', async ({ page }) => {
    await page.goto('/en/');

    const switcher = page.getByRole('navigation', { name: /change language/i });
    await expect(switcher.locator('[aria-current="true"]')).toHaveText(/EN/);
    await expect(switcher.getByRole('link', { name: 'English' })).toHaveCount(0);
  });
});

test.describe('theme', () => {
  test('toggles, persists across navigation and survives a reload', async ({ page }) => {
    await page.goto('/');
    await page.emulateMedia({ colorScheme: 'light' });

    const toggle = page.locator('[data-theme-toggle]');
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.goto('/projetos/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('follows the OS preference until a choice is made', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    /* No attribute is written: the stylesheet media query decides. */
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);

    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const channels = (background.match(/\d+/g) ?? []).map(Number);
    const total = channels.slice(0, 3).reduce((sum, channel) => sum + channel, 0);
    expect(total, 'dark scheme should paint a dark background').toBeLessThan(200);
  });

  test('describes the action it performs, not the state it is in', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en/');

    const toggle = page.locator('[data-theme-toggle]');
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to dark theme');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');
  });
});

test.describe('mobile navigation', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens, navigates and closes with the keyboard', async ({ page }) => {
    await page.goto('/');

    const menu = page.locator('[data-mobile-menu]');
    const summary = menu.locator('summary');

    await expect(menu).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(menu).toHaveAttribute('open', '');

    const projectsLink = menu.getByRole('link', { name: 'Projetos' });
    await expect(projectsLink).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(menu).not.toHaveAttribute('open', '');
    await expect(summary).toBeFocused();
  });

  test('navigates and does not stay open behind the new page', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-mobile-menu] summary').click();
    await page.locator('[data-mobile-menu]').getByRole('link', { name: 'Artigos' }).click();

    await expect(page).toHaveURL('/artigos/');
    await expect(page.locator('[data-mobile-menu]')).not.toHaveAttribute('open', '');
  });

  test('keeps the navigation links in the HTML even while collapsed', async ({ page }) => {
    const html = await (await page.request.get('/')).text();

    for (const label of ['Projetos', 'Artigos', 'Lab', 'Sobre']) {
      expect(html, `"${label}" must be crawlable`).toContain(label);
    }
  });
});

test.describe('skip link', () => {
  test('is the first stop for a keyboard visitor and jumps to the content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skip = page.getByRole('link', { name: /ir para o conteúdo/i });
    await expect(skip).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });
});
