import { LOCALES, type Locale } from '@config/locales';
import { LAB_PROJECT_TYPES } from '@config/taxonomy';
import { getCollection, type CollectionEntry } from 'astro:content';

import {
  compareByDateDesc,
  compareProjects,
  parseEntryId,
  pickRelated,
  relatednessScore,
} from './content-helpers';
import { readingTime } from './reading-time';

/**
 * Query layer over the content collections.
 *
 * Everything the pages render goes through here, which is what keeps draft
 * handling, locale resolution and relationship rules in exactly one place.
 *
 * Drafts are visible while running `astro dev` so work in progress can be
 * previewed, and are absent from every production build — and therefore from
 * the routes, the sitemap and the feeds, since those are all derived from the
 * same queries.
 */
const INCLUDE_DRAFTS = import.meta.env.DEV;

export interface LocalizedArticle {
  id: string;
  translationKey: string;
  /** Public URL segment. Shared across locales so one entity keeps one slug. */
  slug: string;
  locale: Locale;
  data: CollectionEntry<'articles'>['data'];
  readingTime: number;
  entry: CollectionEntry<'articles'>;
}

export interface LocalizedProject {
  id: string;
  translationKey: string;
  slug: string;
  locale: Locale;
  data: CollectionEntry<'projects'>['data'];
  entry: CollectionEntry<'projects'>;
}

function toArticle(entry: CollectionEntry<'articles'>): LocalizedArticle {
  const { translationKey, locale } = parseEntryId(entry.id);
  return {
    id: entry.id,
    translationKey,
    slug: translationKey,
    locale,
    data: entry.data,
    readingTime: readingTime(entry.body ?? ''),
    entry,
  };
}

function toProject(entry: CollectionEntry<'projects'>): LocalizedProject {
  const { translationKey, locale } = parseEntryId(entry.id);
  return {
    id: entry.id,
    translationKey,
    slug: translationKey,
    locale,
    data: entry.data,
    entry,
  };
}

let articlesCache: Promise<LocalizedArticle[]> | undefined;
let projectsCache: Promise<LocalizedProject[]> | undefined;

/** Every article visible in the current mode, across all locales. */
export function getAllArticles(): Promise<LocalizedArticle[]> {
  articlesCache ??= getCollection('articles', ({ data }) => INCLUDE_DRAFTS || !data.draft).then(
    (entries) => entries.map(toArticle).sort(compareByDateDesc),
  );
  return articlesCache;
}

/** Every project visible in the current mode, across all locales. */
export function getAllProjects(): Promise<LocalizedProject[]> {
  projectsCache ??= getCollection('projects', ({ data }) => INCLUDE_DRAFTS || !data.draft).then(
    (entries) => entries.map(toProject).sort(compareProjects),
  );
  return projectsCache;
}

/** Articles for one locale, newest first. */
export async function getArticles(locale: Locale): Promise<LocalizedArticle[]> {
  return (await getAllArticles()).filter((article) => article.locale === locale);
}

/** Projects for one locale, in curated order. */
export async function getProjects(locale: Locale): Promise<LocalizedProject[]> {
  return (await getAllProjects()).filter((project) => project.locale === locale);
}

/**
 * Projects shown in the main portfolio — all of them.
 *
 * Games and experiments are not excluded here: the projects index offers them
 * as filters, and a browser game is portfolio work. The Lab is a second, more
 * informal view over the same entities, not a separate bucket.
 */
export async function getPortfolioProjects(locale: Locale): Promise<LocalizedProject[]> {
  return getProjects(locale);
}

/** Experiments and games, the informal end of the portfolio. */
export async function getLabProjects(locale: Locale): Promise<LocalizedProject[]> {
  return (await getProjects(locale)).filter((project) =>
    LAB_PROJECT_TYPES.includes(project.data.projectType),
  );
}

export async function getArticle(
  translationKey: string,
  locale: Locale,
): Promise<LocalizedArticle | undefined> {
  return (await getAllArticles()).find(
    (article) => article.translationKey === translationKey && article.locale === locale,
  );
}

export async function getProject(
  translationKey: string,
  locale: Locale,
): Promise<LocalizedProject | undefined> {
  return (await getAllProjects()).find(
    (project) => project.translationKey === translationKey && project.locale === locale,
  );
}

/**
 * Locales in which a translation actually exists, in canonical order.
 * The language switcher uses this so it never links to a page that was not
 * built, and `hreflang` only advertises translations that are really there.
 */
export async function getArticleLocales(translationKey: string): Promise<Locale[]> {
  const articles = await getAllArticles();
  return LOCALES.filter((locale) =>
    articles.some(
      (article) => article.translationKey === translationKey && article.locale === locale,
    ),
  );
}

export async function getProjectLocales(translationKey: string): Promise<Locale[]> {
  const projects = await getAllProjects();
  return LOCALES.filter((locale) =>
    projects.some(
      (project) => project.translationKey === translationKey && project.locale === locale,
    ),
  );
}

/** Articles flagged `featured`, newest first. */
export async function getFeaturedArticles(locale: Locale, limit = 1): Promise<LocalizedArticle[]> {
  return (await getArticles(locale)).filter((article) => article.data.featured).slice(0, limit);
}

/** Projects flagged `featured`, in curated order. */
export async function getFeaturedProjects(locale: Locale, limit = 3): Promise<LocalizedProject[]> {
  const projects = await getPortfolioProjects(locale);
  const featured = projects.filter((project) => project.data.featured);
  return (featured.length > 0 ? featured : projects).slice(0, limit);
}

/**
 * Neighbouring articles in publication order, for the previous/next control.
 * `previous` is the older article, `next` the newer one.
 */
export async function getAdjacentArticles(
  article: LocalizedArticle,
): Promise<{ previous?: LocalizedArticle; next?: LocalizedArticle }> {
  const articles = await getArticles(article.locale);
  const index = articles.findIndex((candidate) => candidate.id === article.id);
  if (index === -1) return {};
  return { next: articles[index - 1], previous: articles[index + 1] };
}

/**
 * Related articles: explicit `relatedArticles` first, then the closest matches
 * by category and tags. Only translations that exist in the same locale are
 * offered, so a suggestion never links to a page that was not built.
 */
export async function getRelatedArticles(
  article: LocalizedArticle,
  limit = 3,
): Promise<LocalizedArticle[]> {
  const candidates = (await getArticles(article.locale)).filter(
    (candidate) => candidate.translationKey !== article.translationKey,
  );

  return pickRelated(
    article.data.relatedArticles,
    candidates,
    (candidate) =>
      relatednessScore(
        { category: article.data.category, tags: article.data.tags },
        { category: candidate.data.category, tags: candidate.data.tags },
      ),
    limit,
  );
}

/** Projects an article points at, resolved in the article's own locale. */
export async function getRelatedProjects(article: LocalizedArticle): Promise<LocalizedProject[]> {
  if (article.data.relatedProjects.length === 0) return [];
  const projects = await getProjects(article.locale);
  return article.data.relatedProjects
    .map((key) => projects.find((project) => project.translationKey === key))
    .filter((project): project is LocalizedProject => project !== undefined);
}

/** Articles a project points at, resolved in the project's own locale. */
export async function getProjectArticles(project: LocalizedProject): Promise<LocalizedArticle[]> {
  if (project.data.relatedArticles.length === 0) return [];
  const articles = await getArticles(project.locale);
  return project.data.relatedArticles
    .map((key) => articles.find((article) => article.translationKey === key))
    .filter((article): article is LocalizedArticle => article !== undefined);
}

/**
 * Fails the build when a relationship points at an entity that does not exist.
 *
 * A typo in `relatedProjects` would otherwise degrade silently into a missing
 * section, which is exactly the kind of rot that accumulates unnoticed over
 * years of content. Called from the pages that render relationships.
 */
export async function assertRelationshipsResolve(): Promise<void> {
  /*
   * Validated against the whole content tree, drafts included. Pointing at a
   * draft is legitimate — it is content scheduled to be published, and the link
   * is simply not rendered until it is. Only a key that matches no file at all
   * is a typo, and that is what must stop the build.
   */
  const [allArticles, allProjects] = await Promise.all([
    getCollection('articles'),
    getCollection('projects'),
  ]);

  const articleKeys = new Set(allArticles.map((entry) => parseEntryId(entry.id).translationKey));
  const projectKeys = new Set(allProjects.map((entry) => parseEntryId(entry.id).translationKey));

  const articles = allArticles.map(toArticle);
  const projects = allProjects.map(toProject);
  const problems: string[] = [];

  for (const article of articles) {
    for (const key of article.data.relatedProjects) {
      if (!projectKeys.has(key)) {
        problems.push(
          `articles/${article.id}: relatedProjects references unknown project "${key}"`,
        );
      }
    }
    for (const key of article.data.relatedArticles) {
      if (!articleKeys.has(key)) {
        problems.push(
          `articles/${article.id}: relatedArticles references unknown article "${key}"`,
        );
      }
      if (key === article.translationKey) {
        problems.push(`articles/${article.id}: relatedArticles references itself`);
      }
    }
  }

  for (const project of projects) {
    for (const key of project.data.relatedArticles) {
      if (!articleKeys.has(key)) {
        problems.push(
          `projects/${project.id}: relatedArticles references unknown article "${key}"`,
        );
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`Unresolved content relationships:\n  - ${problems.join('\n  - ')}`);
  }
}
