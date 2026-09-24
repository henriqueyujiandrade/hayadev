import { expect, test } from '@playwright/test';

import { person } from '../../src/config/person';

test.describe('contact page', () => {
  test('is linked from the site navigation', async ({ page }) => {
    await page.goto('/');
    /* The footer copy of the navigation is the one visible on every viewport. */
    await page
      .getByRole('navigation', { name: /navegação do rodapé/i })
      .getByRole('link', { name: 'Contato' })
      .click();

    await expect(page).toHaveURL('/contato/');
    await expect(page.locator('h1')).toHaveText('Contato');
  });

  test('composes a prefilled email from the subject and message', async ({ page }) => {
    await page.goto('/contato/');

    const form = page.locator('[data-contact-form]');
    await form.getByLabel('Assunto').fill('Proposta & ideia');
    await form.getByLabel('Mensagem').fill('Olá!\nTudo bem?');
    await form.getByRole('button', { name: 'Abrir no meu e-mail' }).click();

    await expect(form).toHaveAttribute(
      'data-mailto',
      `mailto:${person.email}?subject=Proposta%20%26%20ideia&body=Ol%C3%A1!%0D%0ATudo%20bem%3F`,
    );
    /* Offered afterwards for visitors whose device has no mail app. */
    await expect(form.getByRole('button', { name: 'Copiar e-mail' })).toBeVisible();
  });

  test('does not compose anything while a required field is empty', async ({ page }) => {
    await page.goto('/contato/');

    const form = page.locator('[data-contact-form]');
    await form.getByLabel('Assunto').fill('Só o assunto');
    await form.getByRole('button', { name: 'Abrir no meu e-mail' }).click();

    await expect(form).not.toHaveAttribute('data-mailto', /.+/);
    await expect(form.getByLabel('Mensagem')).toBeFocused();
  });

  test('lists every configured channel, opening external ones safely', async ({ page }) => {
    await page.goto('/contato/');

    const channels = page.getByRole('region', { name: 'Canais' });
    await expect(channels.getByRole('link', { name: /E-mail/ })).toHaveAttribute(
      'href',
      `mailto:${person.email}`,
    );

    const whatsapp = channels.getByRole('link', { name: /WhatsApp/ });
    await expect(whatsapp).toHaveAttribute(
      'href',
      new RegExp(`^https://wa\\.me/${person.whatsapp}\\?text=`),
    );
    await expect(whatsapp).toHaveAttribute('rel', 'noopener noreferrer');

    for (const name of ['LinkedIn', 'GitHub']) {
      await expect(channels.getByRole('link', { name: new RegExp(name) })).toHaveAttribute(
        'target',
        '_blank',
      );
    }
  });
});
