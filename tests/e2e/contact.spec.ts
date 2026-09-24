import { expect, test, type Page } from '@playwright/test';

import { contactForm } from '../../src/config/contact';
import { person } from '../../src/config/person';

/** Fills every required field of the contact form. */
async function fillForm(page: Page) {
  const form = page.locator('[data-contact-form]');
  await form.getByLabel('Nome').fill('Ada Lovelace');
  await form.getByLabel('Seu e-mail').fill('ada@example.com');
  await form.getByLabel('Assunto').fill('Proposta de projeto');
  await form.getByLabel('Mensagem').fill('Olá!\nTudo bem?');
  return form;
}

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

  test('delivers the message through the form service and confirms it', async ({ page }) => {
    /* Never reach the real service from a test run: it would send a real email. */
    let payload: Record<string, unknown> | undefined;
    await page.route(contactForm.endpoint, async (route) => {
      payload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ json: { success: true, message: 'Email sent successfully!' } });
    });

    await page.goto('/contato/');
    const form = await fillForm(page);
    await form.getByRole('button', { name: 'Enviar mensagem' }).click();

    await expect(form.getByText(/Mensagem enviada/)).toBeVisible();
    expect(payload).toMatchObject({
      access_key: contactForm.accessKey,
      from_name: contactForm.fromName,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      subject: 'Proposta de projeto',
      message: 'Olá!\nTudo bem?',
    });
    expect(payload).not.toHaveProperty('botcheck');
    await expect(form.getByLabel('Mensagem')).toHaveValue('');
  });

  test('keeps the message and offers the address when delivery fails', async ({ page }) => {
    await page.route(contactForm.endpoint, (route) =>
      route.fulfill({ status: 500, json: { success: false, message: 'Server error' } }),
    );

    await page.goto('/contato/');
    const form = await fillForm(page);
    await form.getByRole('button', { name: 'Enviar mensagem' }).click();

    await expect(form.getByText(/Não foi possível enviar/)).toBeVisible();
    await expect(form.getByRole('button', { name: 'Copiar e-mail' })).toBeVisible();
    await expect(form.getByLabel('Mensagem')).toHaveValue('Olá!\nTudo bem?');
    await expect(form.getByRole('button', { name: 'Enviar mensagem' })).toBeEnabled();
  });

  test('sends nothing while a required field is empty', async ({ page }) => {
    let requests = 0;
    await page.route(contactForm.endpoint, (route) => {
      requests += 1;
      return route.abort();
    });

    await page.goto('/contato/');
    const form = await fillForm(page);
    await form.getByLabel('Mensagem').fill('');
    await form.getByRole('button', { name: 'Enviar mensagem' }).click();

    await expect(form.getByLabel('Mensagem')).toBeFocused();
    expect(requests).toBe(0);
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
