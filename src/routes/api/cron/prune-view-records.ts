import { pruneViewRecords } from '@/features/artworks/actions/view-count';
import { cronHandler } from '@/lib/cron-route';
import { createFileRoute } from '@tanstack/react-router';

// Scheduled nightly in vercel.json
export const Route = createFileRoute('/api/cron/prune-view-records')({
  server: {
    handlers: {
      GET: cronHandler('View records pruning', async () => ({
        deletedViewRecords: await pruneViewRecords(),
      })),
    },
  },
});
