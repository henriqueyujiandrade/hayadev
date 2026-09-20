import { describe, expect, it } from 'vitest';

import { readingTime } from '@utils/reading-time';

describe('readingTime', () => {
  it('never reports less than a minute', () => {
    expect(readingTime('')).toBe(1);
    expect(readingTime('Two words.')).toBe(1);
  });

  it('scales with the amount of prose', () => {
    const short = readingTime('word '.repeat(200));
    const long = readingTime('word '.repeat(1000));
    expect(short).toBe(1);
    expect(long).toBeGreaterThan(short);
  });

  it('does not let a code block inflate the estimate like prose', () => {
    const prose = 'word '.repeat(600);
    const code = ['```ts', 'const value = 1;'.repeat(300), '```'].join('\n');

    /* The same volume of characters must not read as the same amount of time. */
    expect(readingTime(prose + code)).toBeLessThan(readingTime(prose + prose));
  });

  it('ignores MDX import statements and JSX tags', () => {
    const withMdx = [
      "import Chart from '@components/Chart.astro';",
      '<Chart data={values} />',
      'Real prose here.',
    ].join('\n\n');

    expect(readingTime(withMdx)).toBe(1);
  });
});
