import type { APIRoute } from 'astro';

import { siteConfig } from '@config/site';

/**
 * Generated rather than kept as a static file so the sitemap URL can never
 * drift from `site` in the Astro config.
 *
 * Nothing is disallowed: CSS, JavaScript and images must stay crawlable for
 * Google to render and assess the pages. Drafts need no rule here — they have
 * no routes in a production build, so there is nothing to hide.
 */
export const GET: APIRoute = () => {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${siteConfig.url}/sitemap-index.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
