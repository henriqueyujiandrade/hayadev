/**
 * Locale definitions. Kept free of any Astro import so it can be consumed by
 * `astro.config.ts`, the content schemas, the runtime and the test suite alike.
 */

export const DEFAULT_LOCALE = 'pt-BR' as const;

export const LOCALES = ['pt-BR', 'en', 'es'] as const;

export type Locale = (typeof LOCALES)[number];

/** `<html lang>` value for each locale. */
export const HTML_LANG: Record<Locale, string> = {
  'pt-BR': 'pt-BR',
  en: 'en',
  es: 'es',
};

/** `hreflang` value published for each locale. */
export const HREFLANG: Record<Locale, string> = {
  'pt-BR': 'pt-BR',
  en: 'en',
  es: 'es',
};

/** Open Graph `og:locale` value for each locale. */
export const OG_LOCALE: Record<Locale, string> = {
  'pt-BR': 'pt_BR',
  en: 'en_US',
  es: 'es_ES',
};

/** Endonym shown in the language switcher. */
export const LOCALE_LABEL: Record<Locale, string> = {
  'pt-BR': 'Português',
  en: 'English',
  es: 'Español',
};

/** Compact label for narrow viewports. */
export const LOCALE_SHORT_LABEL: Record<Locale, string> = {
  'pt-BR': 'PT',
  en: 'EN',
  es: 'ES',
};

/** URL path prefix. The default locale is served from the root. */
export const LOCALE_PREFIX: Record<Locale, string> = {
  'pt-BR': '',
  en: 'en',
  es: 'es',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Narrows an unknown value to a `Locale`, falling back to the default. */
export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
