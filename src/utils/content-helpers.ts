import { isLocale, type Locale } from '@config/locales';

/**
 * Pure helpers for the content layer.
 *
 * Deliberately free of `astro:content` imports so they can be unit tested in
 * plain Node without booting Astro's virtual modules.
 */

export interface EntryIdentity {
  /** Directory name: the logical entity, shared by every translation. */
  translationKey: string;
  /** File name: the language of this particular document. */
  locale: Locale;
}

/**
 * Splits a collection entry id of the form `<translation-key>/<locale>`.
 * Throws rather than guessing: an unparseable id means the content tree is
 * malformed and the build must stop.
 */
export function parseEntryId(id: string): EntryIdentity {
  const separator = id.lastIndexOf('/');
  const translationKey = separator === -1 ? '' : id.slice(0, separator);
  const locale = separator === -1 ? '' : id.slice(separator + 1);

  if (!translationKey || !isLocale(locale)) {
    throw new Error(
      `Malformed content id "${id}". Expected "<translation-key>/<locale>", ` +
        'produced by the directory layout src/content/<collection>/<key>/<locale>.mdx.',
    );
  }

  return { translationKey, locale };
}

/** Newest first; ties broken by title so ordering is stable across builds. */
export function compareByDateDesc<T extends { data: { pubDate: Date; title: string } }>(
  a: T,
  b: T,
): number {
  const delta = b.data.pubDate.getTime() - a.data.pubDate.getTime();
  return delta !== 0 ? delta : a.data.title.localeCompare(b.data.title);
}

/** Explicit `order` first, then most recent year, then title. */
export function compareProjects<T extends { data: { order: number; year: number; title: string } }>(
  a: T,
  b: T,
): number {
  if (a.data.order !== b.data.order) return a.data.order - b.data.order;
  if (a.data.year !== b.data.year) return b.data.year - a.data.year;
  return a.data.title.localeCompare(b.data.title);
}

/**
 * Scores how related two articles are, used only as a fallback when an article
 * does not declare `relatedArticles` explicitly. Same category is worth more
 * than any single shared tag, and a zero score means "do not suggest".
 */
export function relatednessScore(
  a: { category: string; tags: readonly string[] },
  b: { category: string; tags: readonly string[] },
): number {
  const sharedTags = a.tags.filter((tag) => b.tags.includes(tag)).length;
  return (a.category === b.category ? 3 : 0) + sharedTags;
}

/**
 * Picks related items: everything explicitly declared (in the author's order),
 * topped up with the best-scoring remaining candidates.
 */
export function pickRelated<T extends { translationKey: string }>(
  explicitKeys: readonly string[],
  candidates: readonly T[],
  score: (candidate: T) => number,
  limit: number,
): T[] {
  const byKey = new Map(candidates.map((candidate) => [candidate.translationKey, candidate]));

  const picked: T[] = [];
  for (const key of explicitKeys) {
    const match = byKey.get(key);
    if (match && !picked.includes(match)) picked.push(match);
  }

  if (picked.length < limit) {
    const remaining = candidates
      .filter((candidate) => !picked.includes(candidate))
      .map((candidate) => ({ candidate, score: score(candidate) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    for (const { candidate } of remaining) {
      if (picked.length >= limit) break;
      picked.push(candidate);
    }
  }

  return picked.slice(0, limit);
}

/** Case-insensitive, accent-insensitive key used by the client-side search. */
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
