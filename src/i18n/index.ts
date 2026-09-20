import type { Locale } from '@config/locales';

import { en } from './en';
import { es } from './es';
import { ptBR } from './pt-BR';
import type { UIDictionary } from './types';

const dictionaries: Record<Locale, UIDictionary> = {
  'pt-BR': ptBR,
  en,
  es,
};

/** Returns the UI strings for a locale. */
export function useTranslations(locale: Locale): UIDictionary {
  return dictionaries[locale];
}

/**
 * Substitutes `{name}` placeholders in a dictionary string.
 * Kept deliberately small — there is no need for an ICU message formatter here.
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export type { UIDictionary };
export { dictionaries };
