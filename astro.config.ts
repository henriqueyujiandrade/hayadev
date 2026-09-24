import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import { contactForm } from './src/config/contact';
import { LOCALES, DEFAULT_LOCALE } from './src/config/locales';
import { siteConfig } from './src/config/site';

/**
 * The site is fully static: every public page is rendered to HTML at build time.
 * No adapter is installed on purpose — Vercel serves `dist/` directly. An adapter
 * should only be added if a real SSR/on-demand requirement appears.
 */
/** Web3Forms receives the contact form; see src/config/contact.ts. */
const CONTACT_FORM_ORIGIN = new URL(contactForm.endpoint).origin;

export default defineConfig({
  site: siteConfig.url,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },

  /**
   * Astro's native i18n gives us `Astro.currentLocale` and locale-aware helpers.
   * It cannot translate path segments (`/projetos/` vs `/proyectos/`), so the
   * localized URL map lives in `src/utils/url.ts` and is the single source of
   * truth for links. See README "Internationalization".
   */
  i18n: {
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },

  /*
   * The dev toolbar injects a shadow DOM containing serialized island props,
   * which Playwright's selectors pierce — producing strict-mode violations
   * against the real page. The end-to-end dev server turns it off.
   */
  devToolbar: { enabled: process.env.ASTRO_DEV_TOOLBAR !== 'off' },

  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !/\/(404|500)\/?$/.test(page),
      changefreq: 'weekly',
      lastmod: new Date(),
    }),
  ],

  /*
   * Astro hashes every inline script and style it emits and publishes them in a
   * `<meta http-equiv="content-security-policy">`, so a real CSP ships with a
   * static deployment and no 'unsafe-inline'. Directives that a meta element
   * cannot carry (frame-ancestors, HSTS) are set as response headers in
   * vercel.json instead.
   */
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        `connect-src 'self' ${CONTACT_FORM_ORIGIN}`,
        "base-uri 'self'",
        `form-action 'self' ${CONTACT_FORM_ORIGIN}`,
        "object-src 'none'",
        "manifest-src 'self'",
      ],
      /*
       * `script-src` keeps Astro's per-build hashes, which is where CSP earns
       * its keep. `style-src` cannot: Shiki colours every code token with an
       * inline `style` attribute, and CSP only accepts those under
       * 'unsafe-inline' ('unsafe-hashes' would mean hashing every token on
       * every page). Overriding the sources here also stops Astro emitting
       * style hashes, which a browser would otherwise let take precedence and
       * block the attributes anyway. Style injection without script execution
       * is a far smaller risk than the alternative of no CSP at all.
       */
      styleDirective: { resources: ["'self'", "'unsafe-inline'"] },
    },
  },

  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      /*
       * The high-contrast GitHub themes, not the default ones: `github-light`
       * renders parameters in an orange that measures 3.48:1 on white, below
       * the 4.5:1 that code text needs. The accessibility suite asserts this.
       */
      themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' },
      defaultColor: false,
      wrap: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
