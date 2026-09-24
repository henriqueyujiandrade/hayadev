import type { RouteKey } from '@utils/routes';

export interface NavItem {
  /** Route key resolved to a localized path by `localizedPath`. */
  route: RouteKey;
  /** Key into the `nav` section of the UI dictionary. */
  labelKey: 'projects' | 'articles' | 'lab' | 'about' | 'contact';
}

/** Primary navigation, shared by the header and the footer. */
export const primaryNav: readonly NavItem[] = [
  { route: 'projects', labelKey: 'projects' },
  { route: 'articles', labelKey: 'articles' },
  { route: 'lab', labelKey: 'lab' },
  { route: 'about', labelKey: 'about' },
  { route: 'contact', labelKey: 'contact' },
] as const;
