import type { Page } from '@playwright/test';

/** Every page the site publishes, grouped by locale. */
export const PAGES = {
  'pt-BR': ['/', '/projetos/', '/artigos/', '/lab/', '/sobre/', '/projetos/hidden-object/', '/contato/'],
  en: [
    '/en/',
    '/en/projects/',
    '/en/articles/',
    '/en/lab/',
    '/en/about/',
    '/en/projects/hidden-object/',
    '/en/contact/',
  ],
  es: [
    '/es/',
    '/es/proyectos/',
    '/es/articulos/',
    '/es/lab/',
    '/es/sobre/',
    '/es/proyectos/hidden-object/',
    '/es/contacto/',
  ],
} as const;

export const ALL_PAGES = Object.values(PAGES).flat();

/** Slugs of content kept as drafts: none of these may reach the build. */
export const DRAFT_SLUGS = [
  'perspectiva-2d',
  'regras-de-negocio-http',
  'idempotencia-endpoints',
] as const;

/** Collects console errors and page errors for the lifetime of a page. */
export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

/** Reads the content of a `<meta>` or `<link>` from the document head. */
export async function headAttribute(
  page: Page,
  selector: string,
  attribute = 'content',
): Promise<string | null> {
  const locator = page.locator(selector).first();
  if ((await locator.count()) === 0) return null;
  return locator.getAttribute(attribute);
}
