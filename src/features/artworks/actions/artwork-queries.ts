import type { Prisma } from '@/generated/prisma/client';
import { dashboardAccessMiddleware } from '@/lib/auth-functions';
import { prisma } from '@/lib/prisma';
import { ArtworkSchema, PublicArtworkSchema } from '@/schemas/artwork';
import { ArtworkStatusSchema, IdSchema } from '@/schemas/common';
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
  images: { include: { image: true }, orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }] },
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
    const artworks = await prisma.artwork.findMany({
      where: buildArtworkWhere(filters),
      include: publicArtworkInclude,
      orderBy: buildArtworkOrderBy(filters),
    });
    const parsed = PublicArtworkSchema.array().parse(artworks);
    return filters.sort === 'artist' ? sortByFirstArtist(parsed, filters.order) : parsed;
  });

/** The most recently published notices. */
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

/** Count the current user's notices, optionally with one status. */
export const fetchMyArtworkCount = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .validator(ArtworkStatusSchema.optional())
  .handler(({ data: status, context: { user } }) =>
    prisma.artwork.count({ where: { ...ownedBy(user.id), ...(status && { status }) } }),
  );

/** Total public views of the current user's notices. */
export const fetchMyArtworkViewCount = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(async ({ context: { user } }) => {
    const { _sum } = await prisma.artwork.aggregate({
      where: ownedBy(user.id),
      _sum: { viewCount: true },
    });
    return _sum.viewCount ?? 0;
  });

/** Start every notice stat query without awaiting, so each card streams in independently. */
export const loadArtworkStats = () => ({
  total: fetchMyArtworkCount({ data: undefined }),
  published: fetchMyArtworkCount({ data: 'PUBLISHED' }),
  drafts: fetchMyArtworkCount({ data: 'DRAFT' }),
  views: fetchMyArtworkViewCount(),
});

export type ArtworkStatsData = ReturnType<typeof loadArtworkStats>;

/** Published notices, all writers. */
export const fetchPublishedArtworkCount = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(() => prisma.artwork.count({ where: publishedWhere }));
