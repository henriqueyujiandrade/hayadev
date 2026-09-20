import type { APIRoute } from 'astro';

import { buildFeed } from '@routes/feed';

export const GET: APIRoute = (context) => buildFeed(context, 'pt-BR');
