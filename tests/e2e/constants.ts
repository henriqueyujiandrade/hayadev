/** Production build, served by `astro preview`. */
export const PREVIEW_PORT = 4321;
export const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;

/**
 * Dev server. Drafts only exist here, so the article pipeline — article pages,
 * the table of contents, search and related content — can only be exercised
 * against this server until the first article is published.
 */
export const DEV_PORT = 4322;
export const DEV_URL = `http://localhost:${DEV_PORT}`;
