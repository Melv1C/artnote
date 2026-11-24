import type { Prisma } from '@/generated/prisma/client';
import { dashboardAccessMiddleware } from '@/lib/auth-functions';
import { pageWindow, paginate } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { IdSchema } from '@/schemas/common';
import { publishedWhere } from '@/features/artworks/lib/artwork-status';
import { MapPlaceSchema, PlaceFiltersSchema, PlaceWithRelationsSchema } from '@/schemas/place';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { buildPlaceWhere } from '../lib/place-filters';

const placeInclude = {
  createdBy: { select: { id: true, name: true } },
  updatedBy: { select: { id: true, name: true } },
  artworks: { select: { id: true, title: true } },
} satisfies Prisma.PlaceInclude;

export const fetchPlaces = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .validator(PlaceFiltersSchema)
  .handler(async ({ data: filters }) => {
    const where = buildPlaceWhere(filters);

    const [totalCount, places] = await Promise.all([
      prisma.place.count({ where }),
      prisma.place.findMany({
        where,
        include: placeInclude,
        orderBy: { createdAt: 'desc' },
        ...pageWindow(filters.page, filters.limit),
      }),
    ]);

    return {
      places: PlaceWithRelationsSchema.array().parse(places),
      pagination: paginate(filters.page, filters.limit, totalCount),
    };
  });

export const fetchPlace = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .validator(IdSchema)
  .handler(async ({ data: placeId }) => {
    const place = await prisma.place.findUnique({ where: { id: placeId }, include: placeInclude });
    if (!place) throw notFound();
    return PlaceWithRelationsSchema.parse(place);
  });

/**
 * The places of the public map: those with a position and at least one published notice, each
 * with its number of published notices.
 */
export const fetchMapPlaces = createServerFn({ method: 'GET' }).handler(async () => {
  const places = await prisma.place.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
      artworks: { some: publishedWhere },
    },
    include: { _count: { select: { artworks: { where: publishedWhere } } } },
    orderBy: { name: 'asc' },
  });

  return MapPlaceSchema.array().parse(
    places.map(({ _count, ...place }) => ({ ...place, noticeCount: _count.artworks })),
  );
});
