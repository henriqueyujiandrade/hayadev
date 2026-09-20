import { useEffect, useRef, useState } from 'react';

import { ALL_FACET, FACET_ATTR, ITEM_ATTR, setItemVisible } from '@components/ui/filterable';

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

interface Props {
  options: FilterOption[];
  groupLabel: string;
  noResultsLabel: string;
  /** Grid classes, sized to the number of projects by `projectGridClass`. */
  gridClassName: string;
  /** The server-rendered project grid. */
  children: React.ReactNode;
}

/**
 * Filter bar for the projects index.
 *
 * The grid arrives already rendered as `children`; this island only owns which
 * facet is active and hides the cards that do not match. Options with no
 * matching projects are not offered at all, so the control can never lead to an
 * empty result by accident.
 */
export default function ProjectFilters({
  options,
  groupLabel,
  noResultsLabel,
  gridClassName,
  children,
}: Props) {
  const [active, setActive] = useState<string>(ALL_FACET);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    for (const item of grid.querySelectorAll<HTMLElement>(`[${ITEM_ATTR}]`)) {
      const facet = item.getAttribute(FACET_ATTR);
      setItemVisible(item, active === ALL_FACET || facet === active);
    }
  }, [active]);

  const activeOption = options.find((option) => option.id === active);
  const isEmpty = activeOption !== undefined && activeOption.count === 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2" role="group" aria-label={groupLabel}>
        {options.map((option) => {
          const isActive = option.id === active;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActive(option.id)}
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
      </div>

      <div ref={gridRef} className={gridClassName}>
        {children}
      </div>

      {isEmpty && <p className="text-ink-muted">{noResultsLabel}</p>}
    </div>
  );
}
