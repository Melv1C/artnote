import { prisma } from '@/lib/prisma';
import { ArtworkSchema, ArtworkStatusSchema, UserSchema } from '@/schemas';
import { notFound } from 'next/navigation';

export async function getArtworkById(id: string) {
  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id },
      include: {
        writer: true,
        place: true,
        artists: {
          include: {
            artist: true,
          },
          orderBy: {
            artist: {
              lastName: 'asc',
            },
          },
        },
        images: {
          include: {
            image: true,
          },
          orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }],
        },
      },
    });

    if (!artwork) {
      notFound();
    }

    // If artwork is not published, only allow access for the writer
    if (artwork.status !== ArtworkStatusSchema.Values.PUBLISHED) {
      // This check should be done in the page component with session
      // For now, we'll return the artwork and let the page handle access control
    }

    return ArtworkSchema.extend({
      writer: UserSchema,
    }).parse(artwork);
  } catch (error) {
    console.error('Error fetching artwork:', error);
    notFound();
  }
}

export async function incrementArtworkViewCount(
  id: string,
  sessionId?: string,
  ipAddress?: string,
  userAgent?: string,
  referrer?: string,
) {
  try {
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
          sessionId,
          ipAddress,
          userAgent,
          referrer,
        },
      }),
    ]);
  } catch (error) {
    console.error('Error incrementing view count:', error);
    // Don't throw error for analytics, just log it
  }
}
