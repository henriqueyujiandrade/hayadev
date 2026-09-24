# hayadev.dev

Personal engineering hub of Henrique (HayaDev): projects, technical articles and experiments. Built
as a static, multilingual site with Astro.

- **Live:** https://hayadev.dev
- **Stack:** Astro 7, TypeScript, React (islands only), Tailwind CSS 4, MDX
- **Hosting:** Vercel, as a plain static deployment

## Contents

- [Why it is built this way](#why-it-is-built-this-way)
- [Running it](#running-it)
- [Project structure](#project-structure)
- [Writing an article](#writing-an-article)
- [Adding a project](#adding-a-project)
- [Adding a translation](#adding-a-translation)
- [Drafts](#drafts)
- [Configuration](#configuration)
- [Internationalization](#internationalization)
- [SEO](#seo)
- [Testing](#testing)
- [Deployment](#deployment)
- [Brand assets](#brand-assets)

## Why it is built this way

**Every public page is HTML at build time.** There is no backend, no database and no API call in the
render path. Articles and projects live in the repository as MDX and are compiled into static pages,
so the content is in the initial response — indexable, readable without JavaScript, and fast.

**JavaScript is opt-in, per component.** Astro ships no client runtime by default. React is present,
but only as islands where interaction genuinely needs it: the project filter and the article search.
Controls that appear on every page — the theme toggle, the mobile menu — are a few lines of vanilla
JavaScript, because making them React islands would load the React runtime site-wide to serve one
button.

**Derived data is never stored.** A content file's locale and translation key come from its path;
reading time comes from its body; a project's URL comes from one route map. Nothing has to be kept
in sync by hand.

**Structural mistakes fail the build.** A malformed content path, an invalid schema, a
`relatedProjects` key that matches no project, a missing translation in a UI dictionary — each stops
`pnpm build` or `pnpm check` rather than degrading quietly in production.

## Running it

Requires Node 22.12+ and pnpm.

```bash
pnpm install
pnpm dev          # http://localhost:4321
```

| Script                 | What it does                                            |
| ---------------------- | ------------------------------------------------------- |
| `pnpm dev`             | Dev server. Drafts are visible here, and only here.     |
| `pnpm build`           | Static build into `dist/`                               |
| `pnpm preview`         | Serves the built site                                   |
| `pnpm check`           | `astro check`: TypeScript and content schema validation |
| `pnpm lint`            | ESLint over `.ts`, `.tsx` and `.astro`                  |
| `pnpm format`          | Prettier, including Astro and Tailwind class sorting    |
| `pnpm test`            | Unit tests (Vitest)                                     |
| `pnpm test:e2e`        | End-to-end and accessibility tests (Playwright)         |
| `pnpm verify`          | `check` + `lint` + `test` + `build`, as CI runs them    |
| `pnpm generate:assets` | Regenerates the favicon, app icons and the OG image     |

## Project structure

```text
src/
├── components/      # Presentational components, grouped by domain
│   ├── articles/    # Cards, table of contents, related, share
│   ├── icons/       # Brand marks Lucide no longer ships
│   ├── layout/      # Header, footer, theme bootstrap
│   ├── navigation/  # Nav, language switcher, theme toggle
│   ├── profile/     # Hero, stack, experience timeline
│   ├── projects/    # Cards, grid sizing, filter island
│   ├── seo/         # <head> metadata, JSON-LD, breadcrumbs
│   └── ui/          # Buttons, badges, containers, sections
├── config/          # All personal data and branding, in one place
├── content/         # The site's content: MDX, one folder per entity
├── i18n/            # UI strings, one file per locale
├── layouts/         # Page shells
├── pages/           # Routes. Each file is a 3-line wrapper around a route
├── routes/          # The actual page bodies, shared by all locales
├── styles/          # Design tokens and global stylesheet
└── utils/           # Routing, dates, SEO, content queries
```

`src/pages/` holds one thin file per locale and section, because Astro's routing is file-based and
the URL segments differ per language. Each one delegates to a single implementation in
`src/routes/`, so a page exists three times as a route and once as code.

## Writing an article

Create a folder named after the article. The folder name is both the translation key and the public
slug, and it is shared by every language.

```text
src/content/articles/my-article/
├── pt-BR.mdx
├── en.mdx
└── es.mdx
```

Each file needs frontmatter:

```yaml
---
title: How I structured a Python API to separate business rules from HTTP
description:
  A description of 50 to 200 characters. It becomes the meta description and the card text.
pubDate: 2026-09-18
category: backend # engineering | backend | frontend | architecture | games | performance
tags:
  - Python
  - Django
draft: true # omit or set false to publish
---
Body in MDX.
```

Optional fields: `updatedDate`, `featured`, `heroImage` (plus the required `heroImageAlt`),
`canonical` (only when first published elsewhere), `relatedProjects`, `relatedArticles`.

Locale, reading time and the URL are derived — do not put them in frontmatter.

The article then appears in the index, the RSS feed for its language, the sitemap and the internal
link graph automatically.

## Adding a project

Same shape:

```text
src/content/projects/hidden-object/
├── pt-BR.mdx
├── en.mdx
└── es.mdx
```

```yaml
---
title: Hidden Object
description: 50 to 200 characters, used as the meta description.
shortDescription: One line, used on cards.
projectType: game # website | system | saas | api | game | experiment | library | tool
status: active # active | completed | archived | experimental
role: Development and technical design
technologies: [TypeScript, React, Canvas]
year: 2026
featured: true
---
```

Optional: `cover` (with `coverAlt`), `gallery`, `liveUrl`, `repositoryUrl`, `order`,
`relatedArticles`, `confidential`, `caseStudy`, `draft`.

**Links only render when their URL exists.** A project with no `repositoryUrl` shows no source
button, rather than a dead one.

**Projects typed `game` or `experiment` also appear in the Lab**, which is a second view over the
same entities rather than a separate collection.

### Confidential work

Set `confidential: true`. The page then renders a notice explaining that the work is under
confidentiality, and the schema _rejects_ `liveUrl`, `repositoryUrl` and `gallery` on that entry —
the build fails rather than letting private material be published by accident.

## Images

Put the image file in the entity's own folder and reference it relatively:

```text
src/content/projects/hidden-object/
├── cover.png
├── pt-BR.mdx
└── en.mdx
```

```yaml
cover: ./cover.png
coverAlt: A description of what the image shows.
```

The schema validates that the file exists, and requires the `alt` field whenever an image is set — a
missing description fails the build rather than shipping an unlabelled image. Astro converts the
file to WebP, emits a responsive `srcset`, and sets width and height so the layout does not shift
while it loads.

Alt text is a description for someone who cannot see the image, not a caption or a keyword list.

## Adding a translation

Add the missing file to the entity's folder. Nothing else needs changing:

- the route for that language is generated;
- the language switcher activates that option;
- `hreflang` starts advertising it.

**A language with no file is not linked.** The switcher shows it as unavailable and `hreflang` omits
it, so a translation that does not exist can never produce a 404.

## Drafts

`draft: true` means:

- visible at `pnpm dev`, so work in progress can be previewed;
- **no route at all** in a production build, and therefore absent from the sitemap, the RSS feeds
  and the internal link graph.

Because the routes come from the same query that filters drafts, there is no second rule that could
disagree.

Referring to a draft from `relatedArticles` is allowed — the link simply is not rendered until it is
published. Referring to something that does not exist at all fails the build.

## Configuration

Everything personal lives in `src/config/`. Nothing is hard-coded in a component.

| File            | Holds                                               |
| --------------- | --------------------------------------------------- |
| `site.ts`       | Brand name, canonical URL, default OG image         |
| `person.ts`     | Name, email, location, employer, job title, summary |
| `social.ts`     | Profile URLs                                        |
| `experience.ts` | Work history and spoken languages                   |
| `stack.ts`      | Technical stack, grouped by layer                   |
| `navigation.ts` | Primary navigation                                  |
| `taxonomy.ts`   | Article categories, project types and statuses      |
| `locales.ts`    | Locales, prefixes and language tags                 |

### Social links and email

These start empty, and empty means "do not render". Fill in what exists:

```ts
// src/config/social.ts
export const socialLinks = {
  github: 'https://github.com/…',
  linkedin: 'https://www.linkedin.com/in/…',
  // …
};
```

```ts
// src/config/person.ts
email: 'you@example.com',
whatsapp: '5511912345678', // digits only; shown on the Contact page alone
```

Filling these in adds the icons to the header, footer and About page, adds the contact section to
the home page, and adds the URLs to the `Person` structured data as `sameAs`. Leaving them empty
removes those elements entirely — the site never ships a placeholder.

The Contact page (`/contato/`) lists every configured channel. Its form has no backend: on submit it
builds a `mailto:` URL with the subject and message (`src/utils/contact.ts`) and opens the visitor's
mail app, then offers the address with a copy button for devices without one. The WhatsApp number is
deliberately published only there — not in the footer or the structured data.

### Using a full name

`person.fullName` is the name shown in the hero heading and published in the structured data,
article bylines, `<meta name="author">` and the RSS copyright. When it is empty the site falls back
to `person.name`, which stays the short form used in page titles and the footer.

The hero highlights the initial of every capitalized word in the accent colour, so "Henrique Augusto
Yuji de Andrade" shows H, A, Y and A — the letters behind the brand — while lowercase connectives
such as "de" stay plain. The rule lives in `src/utils/name.ts` and is derived from the name, so
there is nothing to configure.

### Changing the domain

`siteConfig.url` in `src/config/site.ts`. Canonical URLs, `hreflang`, Open Graph, the sitemap and
`robots.txt` all derive from it.

## Internationalization

Three locales: `pt-BR` (default, served from the root), `en` and `es`.

```text
/                          /en/                     /es/
/projetos/                 /en/projects/            /es/proyectos/
/artigos/                  /en/articles/            /es/articulos/
/sobre/                    /en/about/               /es/sobre/
/contato/                  /en/contact/             /es/contacto/
/lab/                      /en/lab/                 /es/lab/
/feed.xml                  /en/feed.xml             /es/feed.xml
```

Astro's native i18n is enabled for locale awareness, but it cannot translate path _segments_ — it
only prefixes a locale. Since this site publishes `/projetos/` and `/proyectos/`, the segment map in
`src/utils/routes.ts` is the single source of truth for internal links:

```ts
localizedPath('projects', 'es', 'hidden-object'); // '/es/proyectos/hidden-object/'
```

An ESLint rule rejects hard-coded localized paths anywhere else, so a link cannot quietly bypass it.

Slugs are deliberately _not_ translated: one entity keeps one identifier in every language, so
switching language preserves the page you are on.

UI strings live in `src/i18n/`, typed against `UIDictionary`. Adding a key to the interface makes
every locale missing it a type error.

## SEO

Applied automatically to every page, from one `<head>` component:

- self-referencing `canonical` (each translation is canonical for itself);
- a complete `hreflang` set plus `x-default`, listing only translations that exist;
- Open Graph and Twitter card metadata;
- JSON-LD: `Person` and `WebSite` on the home page, `Article` on articles,
  `SoftwareSourceCode`/`VideoGame` on projects, `BreadcrumbList` where there is a trail;
- `sitemap-index.xml`, excluding error pages and drafts;
- `robots.txt`, generated so the sitemap URL cannot drift from the config;
- one RSS feed per language.

The end-to-end suite asserts all of this against the built HTML rather than trusting it.

## Testing

```bash
pnpm test         # unit
pnpm test:e2e     # end to end, builds and serves the site first
```

**Unit tests** cover the pure layers: route generation, locale resolution, `hreflang` assembly, date
formatting per locale, reading time, content helpers and dictionary completeness.

**End-to-end tests** run against a real production build and cover what only exists there: every
route in all three languages, metadata correctness, the absence of drafts from routes/sitemap/feeds,
language switching that preserves context, theme persistence, keyboard operation of the mobile menu
and skip link, and the islands.

**Accessibility** is checked with axe on every page, in both colour schemes, against WCAG 2.2 AA.
The palette's contrast ratios were also verified numerically; `--ink-subtle` and `--border-control`
exist specifically to meet the 4.5:1 text and 3:1 non-text thresholds.

## Deployment

Push to GitHub and import the repository in Vercel. No adapter is installed and none is needed — the
output is static files.

| Setting          | Value          |
| ---------------- | -------------- |
| Framework preset | Astro          |
| Build command    | `pnpm build`   |
| Output directory | `dist`         |
| Install command  | `pnpm install` |

`vercel.json` sets `trailingSlash: true` to match the Astro config, adds the security headers, and
caches hashed assets immutably.

An adapter should only be added if a real server-side requirement appears — not to deploy.

### Security headers

`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`,
`Cross-Origin-Opener-Policy` and HSTS come from `vercel.json`. The Content-Security-Policy is
generated by Astro, which hashes every inline script it emits, so `script-src` needs no
`unsafe-inline`. `style-src` does allow it: Shiki colours every code token with an inline `style`
attribute, and CSP has no practical way to hash those.

## Adding analytics

The site ships none, and works without any. Nothing is stubbed out for it either, because an unused
module is just dead code.

To add Vercel Web Analytics later:

```bash
pnpm add @vercel/analytics
```

```astro
---
// src/layouts/BaseLayout.astro
import Analytics from '@vercel/analytics/astro';
---

<body>
  <!-- … -->
  <Analytics />
</body>
```

The CSP in `astro.config.ts` restricts `connect-src` and `script-src` to `'self'`, so a third-party
analytics endpoint has to be added to those directives explicitly. That is deliberate: a script that
can reach anywhere is the thing the policy exists to prevent.

## Diagrams

MDX accepts components, so an architecture diagram belongs in the article as inline SVG or as a
small Astro component — not as a screenshot. SVG stays sharp, responds to the theme through the same
colour tokens as the rest of the page, and its text is selectable and readable by a screen reader.
Any diagram that carries meaning needs a text equivalent nearby or in its `<title>`/`<desc>`.

## Brand assets

The favicon, app icons and the default Open Graph image are generated from one source:

```bash
pnpm generate:assets
```

This is intentionally **not** part of `build`: the rasterizer resolves text through system fonts,
and a CI machine has a different set installed. The outputs are committed.
