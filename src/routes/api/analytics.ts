import { recordAnalyticsEvent } from '@/features/analytics/actions/record-event';
import { createFileRoute } from '@tanstack/react-router';

/** Public beacon endpoint for the browser trackers in `src/features/analytics/lib/tracking.ts`. */
export const Route = createFileRoute('/api/analytics')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        try {
          const recorded = await recordAnalyticsEvent(
            payload,
            request.headers.get('user-agent') ?? '',
          );
          return recorded
            ? new Response(null, { status: 204 })
            : Response.json({ error: 'Invalid event' }, { status: 400 });
        } catch (error) {
          console.error('Recording analytics event failed:', error);
          return Response.json({ error: 'Internal server error' }, { status: 500 });
        }
      },
    },
  },
});
