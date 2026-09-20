/**
 * Content taxonomies.
 *
 * Kept free of Astro imports so schemas, UI dictionaries and unit tests can all
 * share one definition. Adding a value here surfaces every missing translation
 * as a type error, which is what keeps the three locales in step.
 */

export const ARTICLE_CATEGORIES = [
  'engineering',
  'backend',
  'frontend',
  'architecture',
  'games',
  'performance',
] as const;

export const PROJECT_TYPES = [
  'website',
  'system',
  'saas',
  'api',
  'game',
  'experiment',
  'library',
  'tool',
] as const;

export const PROJECT_STATUSES = ['active', 'completed', 'archived', 'experimental'] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];
export type ProjectType = (typeof PROJECT_TYPES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/** Project types that belong in the Lab section rather than the main portfolio. */
export const LAB_PROJECT_TYPES: readonly ProjectType[] = ['experiment', 'game'];

/** Filter buttons offered on the projects index, in display order. */
export const PROJECT_FILTERS = ['all', 'game', 'system', 'api', 'experiment'] as const;
export type ProjectFilter = (typeof PROJECT_FILTERS)[number];
