import { describe, expect, it } from 'vitest';

import { LOCALES } from '@config/locales';
import {
  ROUTE_KEYS,
  feedPath,
  homePath,
  localeFromPath,
  localizedPath,
  notFoundPath,
} from '@utils/routes';

describe('localizedPath', () => {
  it('serves the default locale from the root, without a locale prefix', () => {
    expect(homePath('pt-BR')).toBe('/');
    expect(localizedPath('projects', 'pt-BR')).toBe('/projetos/');
    expect(localizedPath('articles', 'pt-BR')).toBe('/artigos/');
    expect(localizedPath('about', 'pt-BR')).toBe('/sobre/');
    expect(localizedPath('lab', 'pt-BR')).toBe('/lab/');
    expect(localizedPath('contact', 'pt-BR')).toBe('/contato/');
  });

  it('translates the path segment, not just the locale prefix', () => {
    expect(localizedPath('projects', 'en')).toBe('/en/projects/');
    expect(localizedPath('projects', 'es')).toBe('/es/proyectos/');
    expect(localizedPath('articles', 'en')).toBe('/en/articles/');
    expect(localizedPath('articles', 'es')).toBe('/es/articulos/');
    expect(localizedPath('about', 'es')).toBe('/es/sobre/');
    expect(localizedPath('contact', 'en')).toBe('/en/contact/');
    expect(localizedPath('contact', 'es')).toBe('/es/contacto/');
  });

  it('keeps one slug across all locales for the same entity', () => {
    expect(localizedPath('projects', 'pt-BR', 'hidden-object')).toBe('/projetos/hidden-object/');
    expect(localizedPath('projects', 'en', 'hidden-object')).toBe('/en/projects/hidden-object/');
    expect(localizedPath('projects', 'es', 'hidden-object')).toBe('/es/proyectos/hidden-object/');
  });

  it('always produces an absolute, trailing-slashed path', () => {
    for (const locale of LOCALES) {
      for (const route of ROUTE_KEYS) {
        const path = localizedPath(route, locale);
        expect(path.startsWith('/')).toBe(true);
        expect(path.endsWith('/')).toBe(true);
        expect(path).not.toContain('//');
      }
    }
  });

  it('never collides between two routes in the same locale', () => {
    for (const locale of LOCALES) {
      const paths = ROUTE_KEYS.map((route) => localizedPath(route, locale));
      expect(new Set(paths).size).toBe(paths.length);
    }
  });
});

describe('feedPath and notFoundPath', () => {
  it('places file routes without a trailing slash', () => {
    expect(feedPath('pt-BR')).toBe('/feed.xml');
    expect(feedPath('en')).toBe('/en/feed.xml');
    expect(feedPath('es')).toBe('/es/feed.xml');
    expect(notFoundPath('pt-BR')).toBe('/404');
    expect(notFoundPath('en')).toBe('/en/404');
  });
});

describe('localeFromPath', () => {
  it('recovers the locale that owns a path', () => {
    expect(localeFromPath('/artigos/foo/')).toBe('pt-BR');
    expect(localeFromPath('/en/articles/foo/')).toBe('en');
    expect(localeFromPath('/es/articulos/foo/')).toBe('es');
    expect(localeFromPath('/')).toBe('pt-BR');
  });

  it('round-trips with localizedPath for every route and locale', () => {
    for (const locale of LOCALES) {
      for (const route of ROUTE_KEYS) {
        expect(localeFromPath(localizedPath(route, locale))).toBe(locale);
      }
    }
  });
});
