import '@tanstack/react-start/server-only';
import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { createHash } from 'node:crypto';

/** One view per visitor per notice in this window. */
export const VIEW_DEDUPLICATION_WINDOW_MS = 30 * 60 * 1000;

/** Keep the client IP only as a salted hash, so stored rows can't be traced back to an address. */
function hashClientIp(forwardedFor: string | undefined): string | null {
  // `x-forwarded-for` is "client, proxy1, proxy2"; the first entry is the client
  const ip = forwardedFor?.split(',')[0]?.trim();
  if (!ip) return null;
  return createHash('sha256').update(`${env.BETTER_AUTH_SECRET}:${ip}`).digest('hex');
}

/**
 * Count a public view of a notice in `Artwork.viewCount`, at most once per visitor in
 * `VIEW_DEDUPLICATION_WINDOW_MS`. Never throws: a failed count must not break the page.
 */
export async function recordArtworkView({
  artworkId,
  forwardedFor,
}: {
  artworkId: string;
  forwardedFor: string | undefined;
}): Promise<void> {
  try {
    const ipHash = hashClientIp(forwardedFor);

    if (ipHash) {
      const recentView = await prisma.pageView.findFirst({
        where: {
          artworkId,
          ipAddress: ipHash,
          createdAt: { gte: new Date(Date.now() - VIEW_DEDUPLICATION_WINDOW_MS) },
        },
        select: { id: true },
      });
      if (recentView) return;
    }

    await prisma.$transaction([
      prisma.artwork.update({
        where: { id: artworkId },
        data: { viewCount: { increment: 1 }, lastViewedAt: new Date() },
      }),
      prisma.pageView.create({ data: { artworkId, ipAddress: ipHash } }),
    ]);
  } catch (error) {
    console.error('Recording artwork view failed:', error);
  }
}
