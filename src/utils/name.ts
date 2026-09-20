/** A run of a name, flagged when it is the initial of a capitalized word. */
export interface NameSegment {
  text: string;
  highlight: boolean;
}

/**
 * Splits a full name so the initial of every capitalized word can be highlighted.
 *
 * Lowercase connectives ("de", "da", "van") are left alone, which is what makes
 * "Henrique Augusto Yuji de Andrade" highlight exactly H, A, Y and A — the letters
 * behind the "HayaDev" brand. The rule is derived from the name itself, so nothing
 * has to be kept in sync by hand. Joining the segments always gives back the
 * trimmed name, and neighbouring plain runs are merged to keep the markup small.
 */
export function highlightInitials(fullName: string): NameSegment[] {
  const segments: NameSegment[] = [];

  const push = (text: string, highlight: boolean): void => {
    if (!text) return;
    const last = segments.at(-1);
    if (!highlight && last && !last.highlight) {
      last.text += text;
    } else {
      segments.push({ text, highlight });
    }
  };

  for (const token of fullName.trim().split(/(\s+)/)) {
    const [initial = ''] = token;
    const isCapitalized = initial !== '' && initial !== initial.toLowerCase();

    if (isCapitalized) {
      push(initial, true);
      push(token.slice(initial.length), false);
    } else {
      push(token, false);
    }
  }

  return segments;
}
