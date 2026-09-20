/**
 * Site-wide branding and deployment constants.
 *
 * `url` is the canonical production origin and is used to build every absolute
 * URL (canonical tags, hreflang, Open Graph, sitemap, RSS). It must never point
 * at localhost.
 */
export const siteConfig = {
  /** Brand name. */
  name: 'HayaDev',
  /** Canonical production origin, without a trailing slash. */
  url: 'https://hayadev.dev',
  /** Repository that builds this site, shown in the footer when set. */
  repository: '',
  /** Path to the default social sharing image, relative to the site root. */
  defaultOgImage: '/og/hayadev.png',
  /** Dimensions of `defaultOgImage`, required by Open Graph consumers. */
  defaultOgImageSize: { width: 1200, height: 630 },
} as const;

export type SiteConfig = typeof siteConfig;
