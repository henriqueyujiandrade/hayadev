import { LOCALE_PREFIX, LOCALES, type Locale } from '@config/locales';

/**
 * Localized URL segments.
 *
 * Astro's native i18n prefixes a locale but cannot translate path segments,
 * and this site publishes `/projetos/`, `/en/projects/` and `/es/proyectos/`.
 * This map is therefore the single source of truth for every internal link:
 * nothing in the codebase should build a content path by hand.
 */
export const ROUTE_SEGMENTS = {
  home: { 'pt-BR': '', en: '', es: '' },
  projects: { 'pt-BR': 'projetos', en: 'projects', es: 'proyectos' },
  articles: { 'pt-BR': 'artigos', en: 'articles', es: 'articulos' },
  lab: { 'pt-BR': 'lab', en: 'lab', es: 'lab' },
  about: { 'pt-BR': 'sobre', en: 'about', es: 'sobre' },
  contact: { 'pt-BR': 'contato', en: 'contact', es: 'contacto' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof ROUTE_SEGMENTS;

export const ROUTE_KEYS = Object.keys(ROUTE_SEGMENTS) as RouteKey[];

/** Joins path parts into an absolute, trailing-slashed path. */
function joinPath(parts: readonly string[]): string {
  const cleaned = parts.map((part) => part.replace(/^\/+|\/+$/g, '')).filter(Boolean);
  return cleaned.length === 0 ? '/' : `/${cleaned.join('/')}/`;
}

/**
 * Builds the path for a route in a given locale.
 *
 * @param route Logical section of the site.
 * @param locale Target locale.
 * @param slug Optional content slug. Slugs are shared across locales so that a
 *   single entity keeps one stable identifier in every language.
 */
export function localizedPath(route: RouteKey, locale: Locale, slug?: string): string {
  return joinPath([LOCALE_PREFIX[locale], ROUTE_SEGMENTS[route][locale], slug ?? '']);
}

/** Path of the localized home page. */
export function homePath(locale: Locale): string {
  return localizedPath('home', locale);
}

/** Path of the RSS feed for a locale. */
export function feedPath(locale: Locale): string {
  const prefix = LOCALE_PREFIX[locale];
  return prefix ? `/${prefix}/feed.xml` : '/feed.xml';
}

/** Path of the localized 404 page. */
export function notFoundPath(locale: Locale): string {
  const prefix = LOCALE_PREFIX[locale];
  return prefix ? `/${prefix}/404` : '/404';
}

/**
 * Resolves the locale that owns a given pathname, by matching its prefix.
 * Used by tests and by the sitemap/robots checks.
 */
export function localeFromPath(pathname: string): Locale {
  const [first] = pathname.replace(/^\/+/, '').split('/');
  const match = LOCALES.find(
    (locale) => LOCALE_PREFIX[locale] !== '' && LOCALE_PREFIX[locale] === first,
  );
  return match ?? 'pt-BR';
}
