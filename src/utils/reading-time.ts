/**
 * Estimated reading time in whole minutes.
 *
 * Fenced code, inline code, MDX import/export statements and JSX tags are
 * stripped before counting: they inflate a naive word count badly on technical
 * articles, where a single snippet can outweigh several paragraphs of prose.
 * 200 words per minute is a conservative rate for dense technical text.
 */
const WORDS_PER_MINUTE = 200;

/** Seconds of reading time attributed to each fenced code block. */
const SECONDS_PER_CODE_BLOCK = 12;

export function readingTime(body: string): number {
  const codeBlocks = body.match(/^```/gm)?.length ?? 0;

  const prose = body
    .replace(/^---\r?\n[\s\S]*?\r?\n---/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/^\s*(?:import|export)\s.+$/gm, ' ')
    .replace(/<\/?[A-Za-z][^>]*>/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~|-]/g, ' ');

  const words = prose.split(/\s+/).filter(Boolean).length;
  const seconds =
    (words / WORDS_PER_MINUTE) * 60 + Math.floor(codeBlocks / 2) * SECONDS_PER_CODE_BLOCK;

  return Math.max(1, Math.round(seconds / 60));
}
