import type { Prisma } from '@/generated/prisma/client';
import { dashboardAccessMiddleware } from '@/lib/auth-functions';
import { prisma } from '@/lib/prisma';
import { idsContaining } from '@/lib/text-search';
import { ArtworkSchema, PublicArtworkSchema } from '@/schemas/artwork';
import { IdSchema, type ArtworkStatus } from '@/schemas/common';
import { authorSelect } from '@/schemas/user';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from '@/lib/zod';
import { ownedBy, publishedWhere } from '../lib/artwork-status';
import {
  ArtworkFiltersSchema,
  buildArtworkOrderBy,
  buildArtworkWhere,
  sortByFirstArtist,
} from '../lib/artwork-search';

const artworkInclude = {
  place: true,
  artists: { include: { artist: true }, orderBy: { artist: { lastName: 'asc' } } },
  // The writer's order, which the editor saves back; pages pick the main image (`mainImage`)
  images: { include: { image: true }, orderBy: { sortOrder: 'asc' } },
} satisfies Prisma.ArtworkInclude;

// Public reads expose only the writer's public profile, never the full user row
const publicArtworkInclude = {
  ...artworkInclude,
  writer: { select: authorSelect },
} satisfies Prisma.ArtworkInclude;

/** Published notices matching the public list's filters. */
export const fetchFilteredArtworks = createServerFn({ method: 'GET' })
  .validator(ArtworkFiltersSchema)
  .handler(async ({ data: filters }) => {
    const [artworks, artists, places] = await Promise.all([
      idsContaining('artwork', ['title', 'medium', 'notice'], filters.search),
      idsContaining('artist', ['firstName', 'lastName'], filters.search),
      idsContaining('place', ['name'], filters.search),
    ]);
    const found = await prisma.artwork.findMany({
      where: buildArtworkWhere(filters, { artworks, artists, places }),
      include: publicArtworkInclude,
      orderBy: buildArtworkOrderBy(filters),
    });
    const parsed = PublicArtworkSchema.array().parse(found);
    return filters.sort === 'artist' ? sortByFirstArtist(parsed, filters.order) : parsed;
  });

export const fetchLatestPublishedArtworks = createServerFn({ method: 'GET' })
  .validator(z.number().int().min(1).max(24))
  .handler(async ({ data: limit }) =>
    PublicArtworkSchema.array().parse(
      await prisma.artwork.findMany({
        where: publishedWhere,
        include: publicArtworkInclude,
        orderBy: { publishedAt: 'desc' },
        take: limit,
      }),
    ),
  );

/**
 * A published notice for its public page. Has no side effects: the router preloads it on hover;
 * the page records the view itself (`recordNoticeView`).
 */
export const fetchPublishedArtwork = createServerFn({ method: 'GET' })
  .validator(IdSchema)
  .handler(async ({ data: artworkId }) => {
    const artwork = await prisma.artwork.findFirst({
      where: { id: artworkId, ...publishedWhere },
      include: publicArtworkInclude,
    });
    if (!artwork) throw notFound();
    return PublicArtworkSchema.parse(artwork);
  });

/** Any notice, whatever its status, for the preview page. Admins only. */
export const fetchArtworkPreview = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .validator(IdSchema)
  .handler(async ({ data: artworkId }) => {
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      include: publicArtworkInclude,
    });
    if (!artwork) throw notFound();
    return PublicArtworkSchema.parse(artwork);
  });

/** Notices written by the current user, for the dashboard list. */
export const fetchMyArtworks = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(async ({ context: { user } }) =>
    ArtworkSchema.array().parse(
      await prisma.artwork.findMany({
        where: ownedBy(user.id),
        include: artworkInclude,
        orderBy: { updatedAt: 'desc' },
      }),
    ),
  );

/** One of the current user's notices, for the editor. Other writers' notices are not found. */
export const fetchMyArtworkForEdit = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .validator(IdSchema)
  .handler(async ({ data: artworkId, context: { user } }) => {
    const artwork = await prisma.artwork.findFirst({
      where: ownedBy(user.id, artworkId),
      include: artworkInclude,
    });
    if (!artwork) throw notFound();
    return ArtworkSchema.parse(artwork);
  });

/** The current user's notices by status, and their total public views. */
export const fetchMyArtworkStats = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(async ({ context: { user } }) => {
    const [byStatus, { _sum }] = await Promise.all([
      prisma.artwork.groupBy({ by: ['status'], where: ownedBy(user.id), _count: true }),
      prisma.artwork.aggregate({ where: ownedBy(user.id), _sum: { viewCount: true } }),
    ]);
    const count = (status: ArtworkStatus) =>
      byStatus.find(group => group.status === status)?._count ?? 0;
    return {
      total: byStatus.reduce((sum, group) => sum + group._count, 0),
      published: count('PUBLISHED'),
      drafts: count('DRAFT'),
      views: _sum.viewCount ?? 0,
    };
  });

/** Published notices, all writers. */
export const fetchPublishedArtworkCount = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(() => prisma.artwork.count({ where: publishedWhere }));
