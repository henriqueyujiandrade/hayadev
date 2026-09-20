import { describe, expect, it } from 'vitest';

import { LOCALES } from '@config/locales';
import { siteConfig } from '@config/site';
import { getSocialLinks, getSameAs } from '@config/social';
import { localizedPath } from '@utils/routes';
import { buildAlternates, formatTitle, pathsForAllLocales, pathsForLocales } from '@utils/seo';
import { absoluteUrl, isExternalUrl, relForUrl } from '@utils/url';

describe('formatTitle', () => {
  it('appends the brand so the specific part survives truncation', () => {
    expect(formatTitle('Artigos')).toBe('Artigos · HayaDev');
  });

  it('does not repeat the brand when the title already is the brand', () => {
    expect(formatTitle(siteConfig.name)).toBe(siteConfig.name);
  });
});

describe('buildAlternates', () => {
  it('advertises every translation with an absolute URL', () => {
    const paths = pathsForAllLocales((locale) => localizedPath('articles', locale));
    const { alternates, xDefault } = buildAlternates(paths);

    expect(alternates).toHaveLength(LOCALES.length);
    expect(alternates.map((entry) => entry.href)).toEqual([
      'https://hayadev.dev/artigos/',
      'https://hayadev.dev/en/articles/',
      'https://hayadev.dev/es/articulos/',
    ]);
    expect(xDefault).toBe('https://hayadev.dev/artigos/');
  });

  it('omits locales that have no translation, so hreflang cannot 404', () => {
    const paths = pathsForLocales(['pt-BR', 'en'], (locale) =>
      localizedPath('articles', locale, 'foo'),
    );
    const { alternates } = buildAlternates(paths);

    expect(alternates.map((entry) => entry.locale)).toEqual(['pt-BR', 'en']);
    expect(alternates.some((entry) => entry.locale === 'es')).toBe(false);
  });

  it('emits nothing for single-language content: one page is not an alternate set', () => {
    const { alternates, xDefault } = buildAlternates(
      pathsForLocales(['en'], (locale) => localizedPath('articles', locale, 'foo')),
    );

    expect(alternates).toEqual([]);
    expect(xDefault).toBeUndefined();
  });

  it('points x-default at the default locale whenever it exists', () => {
    const { xDefault } = buildAlternates(
      pathsForLocales(['es', 'pt-BR'], (locale) => localizedPath('projects', locale, 'foo')),
    );
    expect(xDefault).toBe('https://hayadev.dev/projetos/foo/');
  });

  it('falls back to the first available translation when the default is missing', () => {
    const { xDefault } = buildAlternates(
      pathsForLocales(['en', 'es'], (locale) => localizedPath('projects', locale, 'foo')),
    );
    expect(xDefault).toBe('https://hayadev.dev/en/projects/foo/');
  });
});

describe('absoluteUrl', () => {
  it('builds canonical URLs on the production origin, never on localhost', () => {
    expect(absoluteUrl('/artigos/')).toBe('https://hayadev.dev/artigos/');
    expect(absoluteUrl('artigos/')).toBe('https://hayadev.dev/artigos/');
    expect(siteConfig.url).not.toContain('localhost');
  });

  it('passes absolute URLs through untouched', () => {
    expect(absoluteUrl('https://example.com/x')).toBe('https://example.com/x');
  });
});

describe('external links', () => {
  it('marks only off-origin URLs as external', () => {
    expect(isExternalUrl('https://github.com/x')).toBe(true);
    expect(isExternalUrl('https://hayadev.dev/artigos/')).toBe(false);
    expect(isExternalUrl('/artigos/')).toBe(false);
  });

  it('protects external links from reaching back through window.opener', () => {
    expect(relForUrl('https://github.com/x')).toBe('noopener noreferrer');
    expect(relForUrl('/artigos/')).toBeUndefined();
  });
});

describe('social configuration', () => {
  it('never publishes a profile that has no URL configured', () => {
    for (const link of getSocialLinks()) {
      expect(link.url.trim()).not.toBe('');
    }
    expect(getSameAs()).toEqual(getSocialLinks().map((link) => link.url));
  });
});
