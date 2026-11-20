import { createServerFn } from '@tanstack/react-start';
import { Prisma } from '@/generated/prisma/client';
import { dashboardAccessMiddleware } from '@/lib/auth-functions';
import { prisma } from '@/lib/prisma';
import { ArtistFiltersSchema, ArtistSchema } from '@/schemas/artist';
import { z } from 'zod';

const artistInclude = {
  createdBy: { select: { id: true, name: true } },
  updatedBy: { select: { id: true, name: true } },
  artworks: {
    select: {
      id: true,
      role: true,
      artwork: { select: { id: true, title: true, status: true } },
    },
  },
} satisfies Prisma.ArtistInclude;

const UserRefSchema = z.object({ id: z.string(), name: z.string() });

const ArtistWithRelationsSchema = ArtistSchema.extend({
  createdBy: UserRefSchema,
  updatedBy: UserRefSchema,
  artworks: z.array(
    z.object({
      id: z.string(),
      role: z.string().nullable(),
      artwork: z.object({ id: z.string(), title: z.string(), status: z.string() }),
    }),
  ),
});

const insensitive = (value: string) => ({ contains: value, mode: Prisma.QueryMode.insensitive });

export const fetchArtists = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .validator((filters: z.input<typeof ArtistFiltersSchema>) => ArtistFiltersSchema.parse(filters))
  .handler(async ({ data: filters }) => {
    const where: Prisma.ArtistWhereInput = {
      ...(filters.search && {
        OR: [
          { firstName: insensitive(filters.search) },
          { lastName: insensitive(filters.search) },
          { biography: insensitive(filters.search) },
        ],
      }),
      ...(filters.name && {
        OR: [{ firstName: insensitive(filters.name) }, { lastName: insensitive(filters.name) }],
      }),
      ...(filters.bornAfter && { birthDate: { gte: new Date(filters.bornAfter) } }),
      ...(filters.bornBefore && { birthDate: { lte: new Date(filters.bornBefore) } }),
    };

    const [totalCount, artists] = await Promise.all([
      prisma.artist.count({ where }),
      prisma.artist.findMany({
        where,
        include: artistInclude,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
    ]);

    return {
      artists: ArtistWithRelationsSchema.array().parse(artists),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / filters.limit),
        hasMore: filters.page * filters.limit < totalCount,
      },
    };
  });

export const fetchArtist = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .validator((artistId: string) => artistId)
  .handler(async ({ data: artistId }) =>
    ArtistWithRelationsSchema.nullable().parse(
      await prisma.artist.findUnique({ where: { id: artistId }, include: artistInclude }),
    ),
  );
