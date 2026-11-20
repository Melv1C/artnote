import { createServerFn } from '@tanstack/react-start';
import { Prisma } from '@/generated/prisma/client';
import { dashboardAccessMiddleware } from '@/lib/auth-functions';
import { prisma } from '@/lib/prisma';
import { PlaceFiltersSchema, PlaceSchema } from '@/schemas/place';
import { z } from 'zod';

const placeInclude = {
  createdBy: { select: { id: true, name: true } },
  updatedBy: { select: { id: true, name: true } },
  artworks: { select: { id: true, title: true } },
} satisfies Prisma.PlaceInclude;

const UserRefSchema = z.object({ id: z.string(), name: z.string() });

const PlaceWithRelationsSchema = PlaceSchema.extend({
  createdBy: UserRefSchema,
  updatedBy: UserRefSchema,
  artworks: z.array(z.object({ id: z.string(), title: z.string() })),
});

const insensitive = (value: string) => ({ contains: value, mode: Prisma.QueryMode.insensitive });

export const fetchPlaces = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .validator((filters: z.input<typeof PlaceFiltersSchema>) => PlaceFiltersSchema.parse(filters))
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
      ...(filters.city && { city: filters.city }),
      ...(filters.country && { country: filters.country }),
    };

    const [totalCount, places] = await Promise.all([
      prisma.place.count({ where }),
      prisma.place.findMany({
        where,
        include: placeInclude,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
    ]);

    return {
      places: PlaceWithRelationsSchema.array().parse(places),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / filters.limit),
        hasMore: filters.page * filters.limit < totalCount,
      },
    };
  });

export const fetchPlace = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .validator((placeId: string) => placeId)
  .handler(async ({ data: placeId }) =>
    PlaceWithRelationsSchema.nullable().parse(
      await prisma.place.findUnique({ where: { id: placeId }, include: placeInclude }),
    ),
  );
