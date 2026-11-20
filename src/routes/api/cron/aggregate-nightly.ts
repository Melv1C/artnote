import { runNightlyAggregation } from '@/features/analytics/actions/run-aggregation';
import { cronHandler } from '@/lib/cron-route';
import { createFileRoute } from '@tanstack/react-router';

// Scheduled in vercel.json
export const Route = createFileRoute('/api/cron/aggregate-nightly')({
  server: { handlers: { GET: cronHandler('Nightly aggregation', () => runNightlyAggregation()) } },
});
