import type { Locale } from '@config/locales';
import {
  getArticles,
  getProjects,
  type LocalizedArticle,
  type LocalizedProject,
} from '@utils/content';

/**
 * `getStaticPaths` builders shared by the localized page files.
 *
 * Each locale has its own page file because the URL segments differ per
 * language (`/artigos/`, `/en/articles/`, `/es/articulos/`) and Astro's routing
 * is file-based. Keeping the path logic here means those files stay three lines
 * long and cannot drift apart.
 *
 * Only entries returned here get a route, so drafts — already filtered out of
 * the queries in a production build — are absent from the site, the sitemap and
 * the feeds by construction rather than by a second rule.
 */

export interface ArticlePathProps {
  article: LocalizedArticle;
}

export interface ProjectPathProps {
  project: LocalizedProject;
}

export async function articlePaths(locale: Locale) {
  const articles = await getArticles(locale);
  return articles.map((article) => ({
    params: { slug: article.slug },
    props: { article } satisfies ArticlePathProps,
  }));
}

export async function projectPaths(locale: Locale) {
  const projects = await getProjects(locale);
  return projects.map((project) => ({
    params: { slug: project.slug },
    props: { project } satisfies ProjectPathProps,
  }));
}
