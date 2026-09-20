import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

import { LOCALES } from './config/locales';
import { ARTICLE_CATEGORIES, PROJECT_STATUSES, PROJECT_TYPES } from './config/taxonomy';

/**
 * Content is stored one directory per logical entity, one file per locale:
 *
 *   src/content/articles/<translationKey>/<locale>.mdx
 *
 * The directory name is the translation key *and* the public slug, so a single
 * entity keeps one stable URL segment in every language. Locale and translation
 * key are therefore derived from the file path and are deliberately absent from
 * the frontmatter: derived data is never hand-maintained.
 */
const LOCALE_PATTERN = LOCALES.join('|');
const ENTRY_ID = new RegExp(`^(?<key>[a-z0-9][a-z0-9-]*)/(?<locale>${LOCALE_PATTERN})$`);

/** Builds `<translationKey>/<locale>` and fails the build on anything else. */
function generateId({ entry }: { entry: string }): string {
  const id = entry.replace(/\.mdx?$/, '');
  if (!ENTRY_ID.test(id)) {
    throw new Error(
      `Invalid content path "${entry}". Expected "<translation-key>/<locale>.mdx" ` +
        `where <translation-key> is lowercase kebab-case and <locale> is one of: ${LOCALES.join(', ')}.`,
    );
  }
  return id;
}

/** An absolute http(s) URL. Used for live demos, repositories and canonicals. */
const externalUrl = z
  .string()
  .trim()
  .refine((value) => /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(value), {
    message: 'Must be an absolute http(s) URL.',
  });

/** Non-empty, trimmed human text. */
const text = (min: number, max: number) => z.string().trim().min(min).max(max);

const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/[^_]*.mdx', generateId }),
  schema: ({ image }) =>
    z
      .object({
        title: text(1, 120),
        description: text(50, 200),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        draft: z.boolean().default(false),
        featured: z.boolean().default(false),
        category: z.enum(ARTICLE_CATEGORIES),
        tags: z.array(text(1, 32)).min(1).max(8),
        heroImage: image().optional(),
        heroImageAlt: text(1, 200).optional(),
        /** Set only when the article was first published elsewhere. */
        canonical: externalUrl.optional(),
        /** Translation keys of related projects, resolved per locale. */
        relatedProjects: z.array(z.string()).default([]),
        /** Translation keys of related articles, resolved per locale. */
        relatedArticles: z.array(z.string()).default([]),
      })
      .strict()
      .superRefine((data, ctx) => {
        if (data.heroImage && !data.heroImageAlt) {
          ctx.addIssue({
            code: 'custom',
            path: ['heroImageAlt'],
            message: 'heroImageAlt is required whenever heroImage is set.',
          });
        }
        if (data.updatedDate && data.updatedDate < data.pubDate) {
          ctx.addIssue({
            code: 'custom',
            path: ['updatedDate'],
            message: 'updatedDate cannot be earlier than pubDate.',
          });
        }
      }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/[^_]*.mdx', generateId }),
  schema: ({ image }) =>
    z
      .object({
        title: text(1, 80),
        /** Long description, used for `meta description` on the project page. */
        description: text(50, 200),
        /** One line, used on cards and listings. */
        shortDescription: text(20, 120),
        projectType: z.enum(PROJECT_TYPES),
        status: z.enum(PROJECT_STATUSES),
        /** The person's role on the project, in the entry's language. */
        role: text(2, 80),
        technologies: z.array(text(1, 32)).min(1).max(16),
        year: z.number().int().min(2000).max(2100),
        featured: z.boolean().default(false),
        draft: z.boolean().default(false),
        /**
         * Work covered by confidentiality. The page renders the public summary
         * only and never links to source, demos or screenshots.
         */
        confidential: z.boolean().default(false),
        /** Whether the body is a full case study or a short summary. */
        caseStudy: z.boolean().default(true),
        cover: image().optional(),
        coverAlt: text(1, 200).optional(),
        gallery: z.array(z.object({ image: image(), alt: text(1, 200) }).strict()).default([]),
        liveUrl: externalUrl.optional(),
        repositoryUrl: externalUrl.optional(),
        /** Lower numbers sort first within a listing. */
        order: z.number().int().default(100),
        relatedArticles: z.array(z.string()).default([]),
      })
      .strict()
      .superRefine((data, ctx) => {
        if (data.cover && !data.coverAlt) {
          ctx.addIssue({
            code: 'custom',
            path: ['coverAlt'],
            message: 'coverAlt is required whenever cover is set.',
          });
        }
        if (data.confidential && (data.liveUrl || data.repositoryUrl || data.gallery.length > 0)) {
          ctx.addIssue({
            code: 'custom',
            path: ['confidential'],
            message:
              'A confidential project must not publish liveUrl, repositoryUrl or gallery images.',
          });
        }
      }),
});

export const collections = { articles, projects };
