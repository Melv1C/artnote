import '@tanstack/react-start/server-only';
import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { createHash } from 'node:crypto';
import { publishedWhere } from '../lib/artwork-status';
import { VIEW_DEDUPLICATION_WINDOW_MS, viewRecordsExpireBefore } from '../lib/view-count';

/** Keep the client IP only as a salted hash, so stored rows can't be traced back to an address. */
const hashIp = (ip: string) =>
  createHash('sha256').update(`${env.BETTER_AUTH_SECRET}:${ip}`).digest('hex');

/**
 * Count a public view of a notice in `Artwork.viewCount`, at most once per client IP in
 * `VIEW_DEDUPLICATION_WINDOW_MS`. Requests without a client IP (the local dev server) are not
 * counted. Never throws: a failed count must not break the page.
 */
export async function recordView({
  artworkId,
  clientIp,
}: {
  artworkId: string;
  clientIp: string | null;
}): Promise<void> {
  // Without a client IP a view cannot be deduplicated: do not count it
  if (!clientIp) return;
  try {
    const ipHash = hashIp(clientIp);

    // Not atomic with the write below: two simultaneous requests may both count, which is
    // acceptable for a view counter
    const recentView = await prisma.pageView.findFirst({
      where: {
        artworkId,
        ipAddress: ipHash,
        createdAt: { gte: new Date(Date.now() - VIEW_DEDUPLICATION_WINDOW_MS) },
      },
      select: { id: true },
    });
    if (recentView) return;

    await prisma.$transaction(async tx => {
      // Only published notices count; an unknown or unpublished id is ignored
      const artwork = await tx.artwork.findFirst({
        where: { id: artworkId, ...publishedWhere },
        select: { updatedAt: true },
      });
      if (!artwork) return;
      // A view is not an edit: keep the modified date that `@updatedAt` would otherwise move. An
      // edit saved since the read wins, and this view goes uncounted.
      const { count } = await tx.artwork.updateMany({
        where: { id: artworkId, updatedAt: artwork.updatedAt },
        data: {
          viewCount: { increment: 1 },
          lastViewedAt: new Date(),
          updatedAt: artwork.updatedAt,
        },
      });
      if (count) await tx.pageView.create({ data: { artworkId, ipAddress: ipHash } });
    });
  } catch (error) {
    console.error('Recording artwork view failed:', error);
  }
}

/** Delete the deduplication records that can no longer affect a count. Run by the nightly cron. */
export async function pruneViewRecords(now: Date = new Date()): Promise<number> {
  const { count } = await prisma.pageView.deleteMany({
    where: { createdAt: { lt: viewRecordsExpireBefore(now) } },
  });
  return count;
}
