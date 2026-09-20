/**
 * Key under which an explicit theme choice is stored.
 *
 * Lives in a plain module because it is shared by the blocking inline script in
 * <head> and the bundled toggle script — client scripts can import from `.ts`
 * modules but not from an `.astro` component's frontmatter.
 */
export const THEME_STORAGE_KEY = 'hayadev:theme';

export type Theme = 'light' | 'dark';
