import type { Locale } from '@config/locales';

/**
 * BCP 47 tags passed to `Intl`. Content dates are authored as plain `YYYY-MM-DD`
 * strings and parsed as UTC midnight, so every formatter is pinned to UTC —
 * otherwise a build machine west of Greenwich would render the previous day.
 */
const INTL_LOCALE: Record<Locale, string> = {
  'pt-BR': 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
};

const longDate = new Map<Locale, Intl.DateTimeFormat>();
const monthYear = new Map<Locale, Intl.DateTimeFormat>();

function longDateFormatter(locale: Locale): Intl.DateTimeFormat {
  let formatter = longDate.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
    longDate.set(locale, formatter);
  }
  return formatter;
}

function monthYearFormatter(locale: Locale): Intl.DateTimeFormat {
  let formatter = monthYear.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      year: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    });
    monthYear.set(locale, formatter);
  }
  return formatter;
}

/** "18 de setembro de 2026" / "September 18, 2026" / "18 de septiembre de 2026". */
export function formatDate(date: Date, locale: Locale): string {
  return longDateFormatter(locale).format(date);
}

/** "abril de 2023" / "April 2023" / "abril de 2023". */
export function formatMonthYear(value: string, locale: Locale): string {
  return monthYearFormatter(locale).format(parseMonth(value));
}

/** Parses an ISO `YYYY-MM` string into a UTC date at the first of the month. */
export function parseMonth(value: string): Date {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) throw new Error(`Expected an ISO "YYYY-MM" value, received "${value}".`);
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
}

/** `YYYY-MM-DD`, for `datetime` attributes and structured data. */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Full ISO 8601 timestamp, for structured data and RSS. */
export function toISODateTime(date: Date): string {
  return date.toISOString();
}

/** Four-digit year of a date, in UTC. */
export function yearOf(date: Date): number {
  return date.getUTCFullYear();
}
