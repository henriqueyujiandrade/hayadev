/**
 * Shared contract between the Astro-rendered lists and the React islands that
 * filter them.
 *
 * The lists themselves are rendered on the server, so the full content is in the
 * static HTML and is indexable and readable without JavaScript. The islands add
 * a control surface and hide non-matching items that are already on the page,
 * rather than re-rendering the list client-side. That keeps exactly one
 * implementation of every card — the Astro one — and means a failed or disabled
 * script degrades to the complete, unfiltered list.
 */

/** Marks a filterable item and carries the values it can be matched against. */
export const ITEM_ATTR = 'data-filterable';
/** Facet value of an item, e.g. a project type or an article category. */
export const FACET_ATTR = 'data-facet';
/** Pre-normalized text an item can be searched by. */
export const SEARCH_ATTR = 'data-search';

export const ALL_FACET = 'all';

/** Shows or hides one item without disturbing the surrounding layout. */
export function setItemVisible(item: HTMLElement, visible: boolean): void {
  item.toggleAttribute('hidden', !visible);
}

/** Case- and accent-insensitive key used on both sides of the search. */
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
