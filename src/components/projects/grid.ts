/**
 * Grid class for a project listing, chosen from how many projects there are.
 *
 * A three-column grid holding one card reads as a page that failed to load.
 * Narrowing the track count — and the container with it — keeps a small
 * portfolio looking composed and deliberate, in the same left-aligned column as
 * the heading above it, while a larger one still fills the width.
 */
export function projectGridClass(count: number): string {
  if (count <= 1) return 'grid gap-6 max-w-xl';
  if (count === 2) return 'grid gap-6 sm:grid-cols-2 max-w-4xl';
  return 'grid gap-6 md:grid-cols-2 lg:grid-cols-3';
}
