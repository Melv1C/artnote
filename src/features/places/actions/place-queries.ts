import type { Prisma } from '@/generated/prisma/client';
import { dashboardAccessMiddleware } from '@/lib/auth-functions';
import { pageWindow, paginate } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { IdSchema } from '@/schemas/common';
import { PlaceFiltersSchema, PlaceWithRelationsSchema } from '@/schemas/place';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const placeInclude = {
  createdBy: { select: { id: true, name: true } },
  updatedBy: { select: { id: true, name: true } },
  artworks: { select: { id: true, title: true } },
} satisfies Prisma.PlaceInclude;

const insensitive = (value: string) => ({ contains: value, mode: 'insensitive' as const });

export const fetchPlaces = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .validator(PlaceFiltersSchema)
  .handler(async ({ data: filters }) => {
    const where: Prisma.PlaceWhereInput = {
      ...(filters.search && {
        OR: [
          { name: insensitive(filters.search) },
          { address: insensitive(filters.search) },
          { city: insensitive(filters.search) },
        ],
      }),
      ...(filters.type && { type: filters.type }),
      ...(filters.city && { city: insensitive(filters.city) }),
      ...(filters.country && { country: insensitive(filters.country) }),
    };

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
