import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

import { HTML_LANG, type Locale } from '@config/locales';
import { person } from '@config/person';
import { siteConfig } from '@config/site';
import { useTranslations } from '@i18n/index';
import { getArticles } from '@utils/content';
import { localizedPath } from '@utils/routes';
import { absoluteUrl } from '@utils/url';

/**
 * Builds the RSS feed for one locale.
 *
 * One feed per language, each carrying only that language's articles: a reader
 * subscribing to the Portuguese feed should not receive the same piece three
 * times. Drafts never appear, because `getArticles` does not return them in a
 * production build.
 */
export async function buildFeed(context: APIContext, locale: Locale): Promise<Response> {
  const t = useTranslations(locale);
  const articles = await getArticles(locale);

  return rss({
    title: `${siteConfig.name} — ${t.articles.title}`,
    description: t.articles.metaDescription,
    site: context.site ?? siteConfig.url,
    trailingSlash: true,
    customData: [
      `<language>${HTML_LANG[locale]}</language>`,
      `<copyright>© ${new Date().getUTCFullYear()} ${person.fullName || person.name}</copyright>`,
    ].join(''),
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.pubDate,
      link: absoluteUrl(localizedPath('articles', locale, article.slug)),
      categories: [...article.data.tags],
    })),
  });
}
