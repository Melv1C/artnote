import { createFileRoute } from '@tanstack/react-router';
import { Prisma } from '@/generated/prisma/client';
import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { PlaceFiltersSchema } from '@/schemas/place';

async function GET(request: Request) {
  try {
    // Check authentication
    await getRequiredUser();

    const { searchParams } = new URL(request.url);
    const filters = PlaceFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      type: searchParams.get('type') || undefined,
      city: searchParams.get('city') || undefined,
      country: searchParams.get('country') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    });

    // Build where clause
    const where = {
      ...(filters.search && {
        OR: [
          {
            name: {
              contains: filters.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            address: {
              contains: filters.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            city: {
              contains: filters.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
      ...(filters.type && { type: filters.type }),
      ...(filters.city && { city: filters.city }),
      ...(filters.country && { country: filters.country }),
    };

    // Get total count
    const totalCount = await prisma.place.count({ where });

    // Get places with pagination
    const places = await prisma.place.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        updatedBy: {
          select: { id: true, name: true },
        },
        artworks: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    return Response.json({
      places,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / filters.limit),
        hasMore: filters.page * filters.limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching places:', error);
    return Response.json({ error: 'Failed to fetch places' }, { status: 500 });
  }
}

export const Route = createFileRoute('/api/places/')({
  server: {
    handlers: {
      GET: ({ request }) => GET(request),
    },
  },
});
