import type { Locale } from './locales';

/**
 * Everything the site publishes about the person behind the brand.
 *
 * Fields left as an empty string are treated as "not provided" and the UI must
 * omit the corresponding element entirely — never render a placeholder.
 */
export const person = {
  /** Name used across the site. */
  name: 'Henrique',
  /**
   * Full legal name. When filled it is used for the hero heading (with the
   * initial of each capitalized word highlighted), structured data and bylines;
   * otherwise `name` is used.
   */
  fullName: 'Henrique Augusto Yuji de Andrade',
  /** Brand the person publishes under. */
  brand: 'HayaDev',
  /** Contact address. Leave empty to hide every mailto affordance. */
  email: 'henrique_yujiandrade@hotmail.com',
  /**
   * WhatsApp number in E.164 digits (country code, no `+`, spaces or dashes).
   * Only the Contact page links to it — it is kept out of the footer and the
   * structured data so it is published in as few places as possible. Leave
   * empty to hide it.
   */
  whatsapp: '5511970123173',
  /** City and country, shown in the footer and structured data. */
  location: {
    city: 'São Paulo',
    region: 'SP',
    country: 'Brasil',
    countryCode: 'BR',
  },
  /** Current employer. `url` is optional and only linked when provided. */
  currentEmployer: {
    name: 'Self Intelligence for Life',
    shortName: 'SELF',
    url: '',
  },
  /** Years of the professional timeline, used by the About page. */
  availableForWork: false,
} as const;

/** Job title per locale, used in headings and structured data. */
export const jobTitle: Record<Locale, string> = {
  'pt-BR': 'Desenvolvedor Backend / Full Stack',
  en: 'Backend / Full Stack Developer',
  es: 'Desarrollador Backend / Full Stack',
};

/**
 * One-sentence professional summary. Used for `meta description` on the home
 * page and the `Person` structured data. The hero paragraph is its longer
 * sibling, `home.heroIntro` in the UI dictionaries.
 */
export const summary: Record<Locale, string> = {
  'pt-BR':
    'Desenvolvedor backend e full stack. APIs REST e plataformas SaaS multi-tenant com Python, Django, Node.js, NestJS, TypeScript, PostgreSQL e AWS, com integrações Stripe e apps em React e React Native.',
  en: 'Backend and full stack developer. REST APIs and multi-tenant SaaS platforms with Python, Django, Node.js, NestJS, TypeScript, PostgreSQL and AWS, with Stripe integrations and React and React Native apps.',
  es: 'Desarrollador backend y full stack. APIs REST y plataformas SaaS multi-tenant con Python, Django, Node.js, NestJS, TypeScript, PostgreSQL y AWS, con integraciones Stripe y apps en React y React Native.',
};

export type Person = typeof person;
