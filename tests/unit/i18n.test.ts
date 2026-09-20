import { describe, expect, it } from 'vitest';

import { LOCALES, isLocale, toLocale, type Locale } from '@config/locales';
import { ARTICLE_CATEGORIES, PROJECT_STATUSES, PROJECT_TYPES } from '@config/taxonomy';
import { dictionaries, interpolate, useTranslations } from '@i18n/index';

/** Every leaf path in an object, for comparing dictionary shapes. */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('locale helpers', () => {
  it('recognises only the configured locales', () => {
    expect(isLocale('pt-BR')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it('falls back to the default locale for unknown input', () => {
    expect(toLocale('de')).toBe('pt-BR');
    expect(toLocale('es')).toBe('es');
  });
});

describe('dictionaries', () => {
  it('defines exactly the same keys in every locale', () => {
    const reference = keyPaths(dictionaries['pt-BR']).sort();

    for (const locale of LOCALES) {
      expect(keyPaths(dictionaries[locale]).sort(), `locale "${locale}"`).toEqual(reference);
    }
  });

  it('leaves no string empty', () => {
    for (const locale of LOCALES) {
      const walk = (value: unknown, path: string): void => {
        if (typeof value === 'string') {
          expect(value.trim(), `${locale} → ${path}`).not.toBe('');
          return;
        }
        if (typeof value === 'object' && value !== null) {
          for (const [key, child] of Object.entries(value)) walk(child, `${path}.${key}`);
        }
      };
      walk(dictionaries[locale], locale);
    }
  });

  it('translates every taxonomy value, so no label can fall back to a raw id', () => {
    for (const locale of LOCALES) {
      const t = useTranslations(locale);
      for (const category of ARTICLE_CATEGORIES) expect(t.categories[category]).toBeTruthy();
      for (const type of PROJECT_TYPES) expect(t.projectTypes[type]).toBeTruthy();
      for (const status of PROJECT_STATUSES) expect(t.projectStatuses[status]).toBeTruthy();
    }
  });

  it('keeps the placeholders that the UI substitutes', () => {
    for (const locale of LOCALES) {
      const t = useTranslations(locale);
      expect(t.article.readingTime).toContain('{minutes}');
      expect(t.articles.resultsCount).toContain('{count}');
      expect(t.footer.copyright).toContain('{year}');
    }
  });

  it('uses a distinct translation per locale for navigation labels', () => {
    const projects = LOCALES.map((locale: Locale) => useTranslations(locale).nav.projects);
    expect(new Set(projects).size).toBe(LOCALES.length);
  });
});

describe('interpolate', () => {
  it('substitutes named placeholders', () => {
    expect(interpolate('{count} artigos', { count: 3 })).toBe('3 artigos');
    expect(interpolate('© {year} Henrique', { year: 2026 })).toBe('© 2026 Henrique');
  });

  it('leaves unknown placeholders untouched rather than printing "undefined"', () => {
    expect(interpolate('{a} and {b}', { a: '1' })).toBe('1 and {b}');
  });
});
