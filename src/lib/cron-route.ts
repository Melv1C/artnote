import '@tanstack/react-start/server-only';
import { isAuthorizedCronRequest } from './cron-auth';
import { env } from './env';

/**
 * Handler for a Vercel Cron endpoint: checks the `CRON_SECRET` bearer token, runs `job`, and
 * reports its result as JSON.
 */
export const cronHandler =
  (name: string, job: () => Promise<Record<string, unknown>>) =>
  async ({ request }: { request: Request }) => {
    if (!isAuthorizedCronRequest(request, env.CRON_SECRET)) {
      console.warn(`Unauthorized ${name} cron request`);
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startedAt = Date.now();
    try {
      const result = await job();
      const durationMs = Date.now() - startedAt;
      console.info(`${name} cron completed in ${durationMs}ms`, result);
      return Response.json({ ok: true, ...result, durationMs });
    } catch (error) {
      console.error(`${name} cron failed:`, error);
      return Response.json({ ok: false, error: 'Job failed' }, { status: 500 });
    }
  };
