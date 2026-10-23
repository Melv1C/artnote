import { dashboardAccessMiddleware } from '@/lib/auth-functions';
import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { ArtworkSchema, ArtworkStatusSchema } from '@/schemas';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';
import { getArtworkById, getArtworkByIdForPreview } from './get-artwork';
import {
  type ArtworkFilters,
  getFilteredArtworks,
  getLatestPublishedArtworks,
} from './get-artworks';
import { incrementArtworkViewCount } from './track-view';

export const fetchFilteredArtworks = createServerFn({ method: 'GET' })
  .validator((filters: ArtworkFilters) => filters)
  .handler(({ data }) => getFilteredArtworks(data));

export const fetchLatestPublishedArtworks = createServerFn({ method: 'GET' })
  .validator((limit: number) => limit)
  .handler(({ data }) => getLatestPublishedArtworks(data));

/**
 * Load a published artwork for its public page and record the view.
 */
export const fetchPublishedArtwork = createServerFn({ method: 'GET' })
  .validator((artworkId: string) => artworkId)
  .handler(async ({ data: artworkId }) => {
    const artwork = await getArtworkById(artworkId);

    if (!artwork) {
      throw notFound();
    }

    // Increment view count asynchronously (don't await to avoid blocking page render)
    incrementArtworkViewCount(
      artworkId,
      undefined, // sessionId - could be implemented with cookies
      getRequestHeader('x-forwarded-for') || getRequestHeader('x-real-ip') || undefined,
      getRequestHeader('user-agent') || undefined,
      getRequestHeader('referer') || undefined,
    ).catch(viewError => {
      console.error('Failed to increment view count:', viewError);
    });

    return artwork;
  });

export const fetchArtworkPreview = createServerFn({ method: 'GET' })
  .validator((artworkId: string) => artworkId)
  .handler(async ({ data: artworkId }) => {
    const artwork = await getArtworkByIdForPreview(artworkId);

    if (!artwork) {
      throw notFound();
    }

    return artwork;
  });

const adminArtworkInclude = {
  images: {
    include: {
      image: true,
    },
    orderBy: {
      sortOrder: 'asc',
    },
  },
  place: true,
  artists: {
    include: {
      artist: true,
    },
  },
} as const;

/**
 * Artworks written by the current user, for the dashboard list.
 */
export const fetchMyArtworks = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(async () => {
    const user = await getRequiredUser();

    return ArtworkSchema.array().parse(
      await prisma.artwork.findMany({
        where: {
          writerId: user.id,
        },
        include: adminArtworkInclude,
        orderBy: { updatedAt: 'desc' },
      }),
    );
  });

export const fetchMyArtworkForEdit = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .validator((artworkId: string) => artworkId)
  .handler(async ({ data: artworkId }) => {
    const user = await getRequiredUser();

    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      include: adminArtworkInclude,
    });

    if (!artwork || artwork.writerId !== user.id) {
      throw notFound();
    }

    return ArtworkSchema.parse(artwork);
  });

/**
 * Count the current user's artworks, optionally filtered by status.
 */
export const fetchMyArtworkCount = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .validator((status: 'PUBLISHED' | 'DRAFT' | undefined) => status)
  .handler(async ({ data: status }) =>
    prisma.artwork.count({
      where: {
        ...(status && { status: ArtworkStatusSchema.enum[status] }),
        writerId: (await getRequiredUser()).id,
      },
    }),
  );
