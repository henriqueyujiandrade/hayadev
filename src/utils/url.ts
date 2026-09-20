import { siteConfig } from '@config/site';

/** Origin of the site, without a trailing slash. */
export const SITE_ORIGIN = siteConfig.url.replace(/\/+$/, '');

/**
 * Turns a site-relative path into an absolute URL on the canonical origin.
 * Absolute inputs are returned untouched so callers can pass either.
 */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

/** True when a URL points outside the canonical origin. */
export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url) && !url.startsWith(SITE_ORIGIN);
}

/**
 * `rel` value for a link. External links get `noopener noreferrer` so the
 * target page cannot reach back through `window.opener`.
 */
export function relForUrl(url: string): string | undefined {
  return isExternalUrl(url) ? 'noopener noreferrer' : undefined;
}

/** Normalizes a pathname to the site's trailing-slash convention. */
export function withTrailingSlash(path: string): string {
  if (path.includes('.') || path.endsWith('/')) return path;
  return `${path}/`;
}

/** Extracts the pathname from an absolute or relative URL. */
export function pathnameOf(url: string | URL): string {
  return typeof url === 'string' ? new URL(url, SITE_ORIGIN).pathname : url.pathname;
}
