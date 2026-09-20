import { DEFAULT_LOCALE, HREFLANG, LOCALES, type Locale } from '@config/locales';
import { siteConfig } from '@config/site';

import { absoluteUrl } from './url';

export interface AlternateLink {
  locale: Locale;
  hreflang: string;
  href: string;
}

export interface SeoData {
  /** Value of `<title>`, already including the brand suffix. */
  title: string;
  description: string;
  /** Absolute canonical URL of this document. */
  canonical: string;
  /** Absolute URLs of the translations that actually exist. */
  alternates: AlternateLink[];
  /** Absolute URL advertised as `hreflang="x-default"`, if any. */
  xDefault?: string;
  ogType: 'website' | 'article';
  ogImage: string;
  ogImageAlt: string;
  noindex: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Builds the `<title>`. The brand is appended rather than prepended so the most
 * specific information survives truncation in search results and browser tabs.
 */
export function formatTitle(title: string): string {
  return title === siteConfig.name ? title : `${title} · ${siteConfig.name}`;
}

/**
 * Builds the `hreflang` set from the paths that were actually generated.
 *
 * Only locales present in `paths` are advertised: pointing `hreflang` at a URL
 * that was never built is a genuine SEO defect, so untranslated content simply
 * does not appear here.
 *
 * `x-default` targets the default locale when it exists, otherwise the first
 * available translation, so there is always a defined entry point.
 */
export function buildAlternates(paths: Partial<Record<Locale, string>>): {
  alternates: AlternateLink[];
  xDefault?: string;
} {
  const alternates = LOCALES.filter((locale) => Boolean(paths[locale])).map((locale) => ({
    locale,
    hreflang: HREFLANG[locale],
    href: absoluteUrl(paths[locale] as string),
  }));

  if (alternates.length < 2) {
    // A single language is not an alternate set; advertising one is noise.
    return { alternates: [], xDefault: undefined };
  }

  const preferred =
    alternates.find((alternate) => alternate.locale === DEFAULT_LOCALE) ?? alternates[0];

  return { alternates, xDefault: preferred?.href };
}

/** Paths for a route that exists in every locale. */
export function pathsForAllLocales(build: (locale: Locale) => string): Record<Locale, string> {
  return Object.fromEntries(LOCALES.map((locale) => [locale, build(locale)])) as Record<
    Locale,
    string
  >;
}

/** Paths for a content entity, restricted to the locales it was translated into. */
export function pathsForLocales(
  locales: readonly Locale[],
  build: (locale: Locale) => string,
): Partial<Record<Locale, string>> {
  return Object.fromEntries(locales.map((locale) => [locale, build(locale)]));
}

/** Absolute URL of the default social image. */
export function defaultOgImage(): string {
  return absoluteUrl(siteConfig.defaultOgImage);
}
