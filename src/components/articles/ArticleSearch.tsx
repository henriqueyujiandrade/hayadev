import { useEffect, useId, useRef, useState } from 'react';

import {
  ALL_FACET,
  FACET_ATTR,
  ITEM_ATTR,
  SEARCH_ATTR,
  normalizeForSearch,
  setItemVisible,
} from '@components/ui/filterable';

export interface CategoryOption {
  id: string;
  label: string;
  count: number;
}

interface Props {
  categories: CategoryOption[];
  searchLabel: string;
  searchPlaceholder: string;
  clearLabel: string;
  noResultsLabel: string;
  /** `{count}` is substituted with the number of matches. */
  resultsCountLabel: string;
  resultsCountOneLabel: string;
  /** The server-rendered article list. */
  children: React.ReactNode;
}

/**
 * Search and category filter for the articles index.
 *
 * Operates on the list Astro already rendered, matching against a normalized
 * string each item carries in `data-search`. Nothing is fetched and no index is
 * downloaded: for a personal archive the DOM is already the index, and the
 * comparison is a substring test over a few hundred items at most.
 */
export default function ArticleSearch({
  categories,
  searchLabel,
  searchPlaceholder,
  clearLabel,
  noResultsLabel,
  resultsCountLabel,
  resultsCountOneLabel,
  children,
}: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>(ALL_FACET);
  const [matches, setMatches] = useState<number | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const needle = normalizeForSearch(query);
    let visible = 0;

    for (const item of list.querySelectorAll<HTMLElement>(`[${ITEM_ATTR}]`)) {
      const matchesCategory = category === ALL_FACET || item.getAttribute(FACET_ATTR) === category;
      const haystack = item.getAttribute(SEARCH_ATTR) ?? '';
      const matchesQuery = needle.length === 0 || haystack.includes(needle);
      const isVisible = matchesCategory && matchesQuery;

      setItemVisible(item, isVisible);
      if (isVisible) visible += 1;
    }

    setMatches(visible);
  }, [query, category]);

  const isFiltered = query.length > 0 || category !== ALL_FACET;
  const countLabel =
    matches === 1 ? resultsCountOneLabel : resultsCountLabel.replace('{count}', String(matches));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor={inputId} className="sr-only">
            {searchLabel}
          </label>
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            autoComplete="off"
            className={[
              'w-full rounded-md border border-border-control bg-surface px-3.5 py-2.5',
              'text-[0.9375rem] text-ink placeholder:text-ink-subtle',
              'transition-colors hover:border-ink-muted focus:border-accent focus:outline-none',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
            ].join(' ')}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((option) => {
            const isActive = option.id === category;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setCategory(option.id)}
                className={[
                  'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5',
                  'font-mono text-[0.75rem] transition-colors',
                  isActive
                    ? 'border-accent bg-accent text-accent-contrast'
                    : 'border-border-control bg-surface text-ink-muted hover:border-ink-muted hover:text-ink',
                ].join(' ')}
              >
                {option.label}
                <span className={isActive ? 'opacity-70' : 'text-ink-subtle'}>{option.count}</span>
              </button>
            );
          })}

          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCategory(ALL_FACET);
              }}
              className="rounded-md px-3 py-1.5 font-mono text-[0.75rem] text-ink-muted underline decoration-border-strong underline-offset-4 transition-colors hover:text-ink"
            >
              {clearLabel}
            </button>
          )}
        </div>
      </div>

      {/* Announced to assistive technology as results change. */}
      <p aria-live="polite" className="font-mono text-[0.75rem] text-ink-subtle">
        {matches !== undefined && isFiltered ? countLabel : ''}
      </p>

      <div ref={listRef} className="flex flex-col">
        {children}
      </div>

      {matches === 0 && <p className="text-ink-muted">{noResultsLabel}</p>}
    </div>
  );
}
