import { buildSitemap } from '@/features/artworks/actions/sitemap';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () =>
        new Response(await buildSitemap(), { headers: { 'Content-Type': 'application/xml' } }),
    },
  },
});
