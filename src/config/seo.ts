/**
 * Defaults applied to pages that do not override them.
 * `robots` is the indexing policy for ordinary public pages.
 */
export const seoDefaults = {
  /** Author name used in `Article` structured data and RSS items. */
  twitterCardType: 'summary_large_image',
  /** Applied to every indexable page. */
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  /** Applied to pages that must stay out of search results. */
  robotsNoIndex: 'noindex, follow',
} as const;
