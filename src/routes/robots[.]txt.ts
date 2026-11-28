import { env } from '@/lib/env';
import { robotsTxt } from '@/lib/search-indexing';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(robotsTxt(env.ALLOW_INDEXING, env.BASE_URL), {
          headers: { 'Content-Type': 'text/plain' },
        }),
    },
  },
});
