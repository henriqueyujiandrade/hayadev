import { describe, expect, it } from 'vitest';

import {
  compareByDateDesc,
  compareProjects,
  normalizeForSearch,
  parseEntryId,
  pickRelated,
  relatednessScore,
} from '@utils/content-helpers';

describe('parseEntryId', () => {
  it('splits the directory layout into an entity and a language', () => {
    expect(parseEntryId('hidden-object/pt-BR')).toEqual({
      translationKey: 'hidden-object',
      locale: 'pt-BR',
    });
    expect(parseEntryId('perspectiva-2d/en')).toEqual({
      translationKey: 'perspectiva-2d',
      locale: 'en',
    });
  });

  it('throws on anything the content layout cannot produce', () => {
    expect(() => parseEntryId('no-locale')).toThrow(/Malformed content id/);
    expect(() => parseEntryId('article/fr')).toThrow(/Malformed content id/);
    expect(() => parseEntryId('/pt-BR')).toThrow(/Malformed content id/);
    expect(() => parseEntryId('article/pt-br')).toThrow(/Malformed content id/);
  });
});

describe('ordering', () => {
  const article = (title: string, pubDate: string) => ({
    data: { title, pubDate: new Date(pubDate) },
  });

  it('puts the newest article first', () => {
    const sorted = [
      article('old', '2025-01-01'),
      article('new', '2026-01-01'),
      article('middle', '2025-06-01'),
    ].sort(compareByDateDesc);

    expect(sorted.map((entry) => entry.data.title)).toEqual(['new', 'middle', 'old']);
  });

  it('breaks date ties by title so builds are reproducible', () => {
    const sorted = [article('b', '2026-01-01'), article('a', '2026-01-01')].sort(compareByDateDesc);
    expect(sorted.map((entry) => entry.data.title)).toEqual(['a', 'b']);
  });

  it('orders projects by curated order, then year, then title', () => {
    const project = (title: string, order: number, year: number) => ({
      data: { title, order, year },
    });
    const sorted = [project('c', 100, 2024), project('a', 10, 2023), project('b', 100, 2026)].sort(
      compareProjects,
    );

    expect(sorted.map((entry) => entry.data.title)).toEqual(['a', 'b', 'c']);
  });
});

describe('relatednessScore', () => {
  const base = { category: 'backend', tags: ['Python', 'APIs'] };

  it('weighs a shared category above a single shared tag', () => {
    const sameCategory = relatednessScore(base, { category: 'backend', tags: [] });
    const oneSharedTag = relatednessScore(base, { category: 'games', tags: ['Python'] });
    expect(sameCategory).toBeGreaterThan(oneSharedTag);
  });

  it('scores nothing in common as zero, so it is not suggested', () => {
    expect(relatednessScore(base, { category: 'games', tags: ['Canvas'] })).toBe(0);
  });
});

describe('pickRelated', () => {
  const candidates = [{ translationKey: 'a' }, { translationKey: 'b' }, { translationKey: 'c' }];

  it('honours explicit relations first, in the order they were declared', () => {
    const picked = pickRelated(['c', 'a'], candidates, () => 1, 3);
    expect(picked.map((entry) => entry.translationKey)).toEqual(['c', 'a', 'b']);
  });

  it('ignores explicit keys that do not resolve, instead of emitting a dead link', () => {
    const picked = pickRelated(['missing'], candidates, () => 0, 3);
    expect(picked).toEqual([]);
  });

  it('never exceeds the limit', () => {
    expect(pickRelated([], candidates, () => 5, 2)).toHaveLength(2);
  });

  it('falls back only to candidates that actually score', () => {
    const picked = pickRelated(
      [],
      candidates,
      (entry) => (entry.translationKey === 'b' ? 3 : 0),
      3,
    );
    expect(picked.map((entry) => entry.translationKey)).toEqual(['b']);
  });
});

describe('normalizeForSearch', () => {
  it('matches regardless of case and accents', () => {
    expect(normalizeForSearch('Idempotência')).toBe('idempotencia');
    expect(normalizeForSearch('  Perspectiva 2D  ')).toBe('perspectiva 2d');
    expect(normalizeForSearch('ARQUITETURA')).toBe('arquitetura');
  });
});
