import type { Prisma } from '@/generated/prisma/client';
import { dashboardAccessMiddleware } from '@/lib/auth-functions';
import { pageWindow, paginate } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { idsContaining } from '@/lib/text-search';
import { ArtistFiltersSchema, ArtistWithRelationsSchema } from '@/schemas/artist';
import { IdSchema } from '@/schemas/common';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const artistInclude = {
  artworks: {
    select: {
      id: true,
      role: true,
      artwork: { select: { id: true, title: true, status: true } },
    },
  },
} satisfies Prisma.ArtistInclude;

export const fetchArtists = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .validator(ArtistFiltersSchema)
  .handler(async ({ data: filters }) => {
    const ids = await idsContaining(
      'artist',
      ['firstName', 'lastName', 'biography'],
      filters.search,
    );
    const where: Prisma.ArtistWhereInput = ids ? { id: { in: ids } } : {};

    const [totalCount, artists] = await Promise.all([
      prisma.artist.count({ where }),
      prisma.artist.findMany({
        where,
        include: artistInclude,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        ...pageWindow(filters.page, filters.limit),
      }),
    ]);

    return {
      artists: ArtistWithRelationsSchema.array().parse(artists),
      pagination: paginate(filters.page, filters.limit, totalCount),
    };
  });

export const fetchArtist = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .validator(IdSchema)
  .handler(async ({ data: artistId }) => {
    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
      include: artistInclude,
    });
    if (!artist) throw notFound();
    return ArtistWithRelationsSchema.parse(artist);
  });
