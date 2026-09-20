import type { Locale } from '@config/locales';
import { jobTitle, person, summary } from '@config/person';
import { getSameAs } from '@config/social';
import { siteConfig } from '@config/site';
import { stack } from '@config/stack';

import { toISODateTime } from './date';
import { homePath } from './routes';
import { absoluteUrl } from './url';

/**
 * JSON-LD builders.
 *
 * Structured data is only emitted where it describes something genuinely
 * present on the page. Every value is derived from the same configuration the
 * visible page uses, so the two can never drift apart — which is the failure
 * mode that gets structured data ignored or penalised.
 */

/** Stable node identifiers, so entities can reference each other. */
export const PERSON_ID = `${siteConfig.url}/#person`;
export const WEBSITE_ID = `${siteConfig.url}/#website`;

/**
 * Every technology on the visible stack, once each. It is the very list the home
 * and About pages render, so the skills in the structured data cannot drift from
 * the ones a reader sees.
 */
export function stackSkills(): string[] {
  return [...new Set(stack.flatMap((group) => group.items))];
}

export function personSchema(locale: Locale): Record<string, unknown> {
  const sameAs = getSameAs();

  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: person.fullName || person.name,
    alternateName: person.brand,
    url: absoluteUrl(homePath(locale)),
    jobTitle: jobTitle[locale],
    description: summary[locale],
    knowsAbout: stackSkills(),
    address: {
      '@type': 'PostalAddress',
      addressLocality: person.location.city,
      addressRegion: person.location.region,
      addressCountry: person.location.countryCode,
    },
    worksFor: {
      '@type': 'Organization',
      name: person.currentEmployer.name,
      ...(person.currentEmployer.url ? { url: person.currentEmployer.url } : {}),
    },
    ...(person.email ? { email: `mailto:${person.email}` } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function websiteSchema(locale: Locale): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: absoluteUrl(homePath(locale)),
    name: siteConfig.name,
    description: summary[locale],
    inLanguage: locale,
    publisher: { '@id': PERSON_ID },
  };
}

export interface ArticleSchemaInput {
  title: string;
  description: string;
  url: string;
  locale: Locale;
  pubDate: Date;
  updatedDate?: Date;
  image?: string;
  tags: readonly string[];
  category: string;
}

export function articleSchema(input: ArticleSchemaInput): Record<string, unknown> {
  return {
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    inLanguage: input.locale,
    datePublished: toISODateTime(input.pubDate),
    dateModified: toISODateTime(input.updatedDate ?? input.pubDate),
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    url: input.url,
    ...(input.image ? { image: input.image } : {}),
    keywords: input.tags.join(', '),
    articleSection: input.category,
  };
}

export interface CreativeWorkSchemaInput {
  title: string;
  description: string;
  url: string;
  locale: Locale;
  year: number;
  technologies: readonly string[];
  image?: string;
  liveUrl?: string;
  repositoryUrl?: string;
  isGame: boolean;
}

export function projectSchema(input: CreativeWorkSchemaInput): Record<string, unknown> {
  return {
    '@type': input.isGame ? 'VideoGame' : 'SoftwareSourceCode',
    name: input.title,
    description: input.description,
    inLanguage: input.locale,
    url: input.url,
    author: { '@id': PERSON_ID },
    dateCreated: String(input.year),
    ...(input.image ? { image: input.image } : {}),
    ...(input.technologies.length > 0
      ? { programmingLanguage: input.technologies.join(', ') }
      : {}),
    ...(input.liveUrl ? { sameAs: input.liveUrl } : {}),
    ...(input.repositoryUrl ? { codeRepository: input.repositoryUrl } : {}),
    ...(input.isGame ? { applicationCategory: 'Game', gamePlatform: 'Web browser' } : {}),
  };
}

export interface BreadcrumbItem {
  name: string;
  /** Site-relative path; converted to an absolute URL here. */
  path: string;
}

export function breadcrumbSchema(items: readonly BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Wraps one or more schema nodes into a single `@graph` document. */
export function graph(nodes: readonly Record<string, unknown>[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
}
