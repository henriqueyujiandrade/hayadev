import type { APIRoute } from 'astro';

import { DEFAULT_LOCALE, HTML_LANG } from '@config/locales';
import { jobTitle, person } from '@config/person';
import { siteConfig } from '@config/site';

/**
 * Generated from the same configuration the pages use, so the installed name,
 * language and theme colours cannot drift from the site itself.
 */
export const GET: APIRoute = () => {
  const manifest = {
    name: `${siteConfig.name} — ${person.name}`,
    short_name: siteConfig.name,
    description: jobTitle[DEFAULT_LOCALE],
    lang: HTML_LANG[DEFAULT_LOCALE],
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fbfaf8',
    theme_color: '#006655',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
