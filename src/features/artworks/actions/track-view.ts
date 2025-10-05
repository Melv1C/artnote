import { prisma } from '@/lib/prisma';

/**
 * Configuration for view tracking deduplication
 */
const VIEW_DEDUPLICATION_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Check if a view should be counted based on recent views
 * Prevents counting multiple views from the same session/IP within a short time window
 */
async function shouldCountView(
  artworkId: string,
  sessionId?: string,
  ipAddress?: string,
): Promise<boolean> {
  if (!sessionId && !ipAddress) {
    // If we have no tracking info, count the view
    return true;
  }

  const deduplicationThreshold = new Date(Date.now() - VIEW_DEDUPLICATION_WINDOW_MS);

  try {
    // Check for recent views from the same session or IP
    const recentView = await prisma.pageView.findFirst({
      where: {
        artworkId,
        createdAt: {
          gte: deduplicationThreshold,
        },
        OR: [sessionId ? { sessionId } : {}, ipAddress ? { ipAddress } : {}].filter(
          obj => Object.keys(obj).length > 0,
        ),
      },
      select: { id: true },
    });

    return !recentView;
  } catch (error) {
    console.error('Error checking view deduplication:', error);
    // On error, be permissive and count the view
    return true;
  }
}

/**
 * Increment artwork view count and record page view for analytics
 *
 * @param id - The artwork ID
 * @param sessionId - Optional anonymous session identifier
 * @param ipAddress - Optional IP address for deduplication
 * @param userAgent - Optional user agent string
 * @param referrer - Optional referrer URL
 *
 * @returns Promise that resolves when the view is tracked, or rejects on error
 */
export async function incrementArtworkViewCount(
  id: string,
  sessionId?: string,
  ipAddress?: string,
  userAgent?: string,
  referrer?: string,
): Promise<void> {
  try {
    // Validate artwork ID
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid artwork ID');
    }

    // Check if we should count this view (deduplication)
    const shouldCount = await shouldCountView(id, sessionId, ipAddress);

    if (!shouldCount) {
      // View already counted recently, skip
      return;
    }

    // Update view count atomically
    await prisma.$transaction([
      // Increment the artwork view count
      prisma.artwork.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
          lastViewedAt: new Date(),
        },
      }),
      // Create a page view record for analytics
      prisma.pageView.create({
        data: {
          artworkId: id,
          sessionId: sessionId || null,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          referrer: referrer || null,
        },
      }),
    ]);
  } catch (error) {
    console.error('Error incrementing view count:', error);
    // Re-throw to allow caller to handle errors appropriately
    throw error;
  }
}

/**
 * Get view statistics for an artwork
 *
 * @param artworkId - The artwork ID
 * @returns Object with view count and unique visitor estimates
 */
export async function getArtworkViewStats(artworkId: string) {
  try {
    const [artwork, uniqueSessions, uniqueIPs, recentViews] = await Promise.all([
      prisma.artwork.findUnique({
        where: { id: artworkId },
        select: { viewCount: true, lastViewedAt: true },
      }),
      prisma.pageView.groupBy({
        by: ['sessionId'],
        where: {
          artworkId,
          sessionId: { not: null },
        },
        _count: true,
      }),
      prisma.pageView.groupBy({
        by: ['ipAddress'],
        where: {
          artworkId,
          ipAddress: { not: null },
        },
        _count: true,
      }),
      prisma.pageView.count({
        where: {
          artworkId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    if (!artwork) {
      throw new Error('Artwork not found');
    }

    return {
      totalViews: artwork.viewCount,
      lastViewedAt: artwork.lastViewedAt,
      uniqueSessions: uniqueSessions.length,
      uniqueIPs: uniqueIPs.length,
      recentViews,
    };
  } catch (error) {
    console.error('Error fetching artwork view stats:', error);
    throw error;
  }
}
