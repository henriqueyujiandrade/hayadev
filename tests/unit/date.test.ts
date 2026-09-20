import { describe, expect, it } from 'vitest';

import { formatDate, formatMonthYear, parseMonth, toISODate, yearOf } from '@utils/date';

/* Authored as a plain date string, exactly as content frontmatter supplies it. */
const DATE = new Date('2026-09-18');

describe('formatDate', () => {
  it('formats according to each locale convention', () => {
    expect(formatDate(DATE, 'pt-BR')).toBe('18 de setembro de 2026');
    expect(formatDate(DATE, 'en')).toBe('September 18, 2026');
    expect(formatDate(DATE, 'es')).toBe('18 de septiembre de 2026');
  });

  it('is pinned to UTC, so a timezone west of Greenwich cannot shift the day', () => {
    const original = process.env.TZ;
    try {
      process.env.TZ = 'America/Sao_Paulo';
      expect(formatDate(new Date('2026-01-01'), 'pt-BR')).toBe('1 de janeiro de 2026');
      expect(toISODate(new Date('2026-01-01'))).toBe('2026-01-01');
    } finally {
      process.env.TZ = original;
    }
  });
});

describe('formatMonthYear', () => {
  it('formats an ISO year-month for the experience timeline', () => {
    expect(formatMonthYear('2023-04', 'pt-BR')).toBe('abril de 2023');
    expect(formatMonthYear('2023-04', 'en')).toBe('April 2023');
    expect(formatMonthYear('2022-02', 'es')).toBe('febrero de 2022');
  });

  it('rejects a malformed value rather than rendering an invalid date', () => {
    expect(() => parseMonth('2023')).toThrow();
    expect(() => parseMonth('2023-4')).toThrow();
    expect(() => parseMonth('')).toThrow();
  });
});

describe('toISODate', () => {
  it('produces a machine-readable date for datetime attributes', () => {
    expect(toISODate(DATE)).toBe('2026-09-18');
    expect(yearOf(DATE)).toBe(2026);
  });
});
