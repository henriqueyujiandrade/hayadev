import { describe, expect, it } from 'vitest';

import { highlightInitials } from '@utils/name';

const highlighted = (name: string): string =>
  highlightInitials(name)
    .filter((segment) => segment.highlight)
    .map((segment) => segment.text)
    .join('');

const rebuilt = (name: string): string =>
  highlightInitials(name)
    .map((segment) => segment.text)
    .join('');

describe('highlightInitials', () => {
  it('highlights the H, A, Y and A behind the brand', () => {
    expect(highlighted('Henrique Augusto Yuji de Andrade')).toBe('HAYA');
  });

  it('leaves lowercase connectives alone', () => {
    expect(highlighted('Maria da Silva')).toBe('MS');
    expect(highlighted('Ludwig van Beethoven')).toBe('LB');
  });

  it('never loses or reorders a character', () => {
    const name = 'Henrique Augusto Yuji de Andrade';

    expect(rebuilt(name)).toBe(name);
    expect(rebuilt('  Ana   Lima ')).toBe('Ana   Lima');
  });

  it('merges plain runs so the markup stays small', () => {
    expect(highlightInitials('Henrique Augusto Yuji de Andrade').map((s) => s.text)).toEqual([
      'H',
      'enrique ',
      'A',
      'ugusto ',
      'Y',
      'uji de ',
      'A',
      'ndrade',
    ]);
  });

  it('handles single-letter words, accents, a single name and an empty one', () => {
    expect(highlighted('A B')).toBe('AB');
    expect(highlighted('Érica Álvares')).toBe('ÉÁ');
    expect(highlightInitials('Henrique')).toEqual([
      { text: 'H', highlight: true },
      { text: 'enrique', highlight: false },
    ]);
    expect(highlightInitials('')).toEqual([]);
  });
});
