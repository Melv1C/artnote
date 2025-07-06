'use server';

import { Prisma } from '@/generated/prisma';
import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { ArtistFiltersSchema, CreateArtistSchema } from '@/schemas/artist';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    await getRequiredUser();

    const searchParams = request.nextUrl.searchParams;
    const filters = ArtistFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      name: searchParams.get('name') || undefined,
      bornAfter: searchParams.get('bornAfter') || undefined,
      bornBefore: searchParams.get('bornBefore') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    });

    // Build where clause
    const where = {
      ...(filters.search && {
        OR: [
          {
            firstName: {
              contains: filters.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            lastName: {
              contains: filters.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            biography: {
              contains: filters.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
      ...(filters.name && {
        OR: [
          {
            firstName: {
              contains: filters.name,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            lastName: {
              contains: filters.name,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
      ...(filters.bornAfter && {
        birthDate: {
          gte: new Date(filters.bornAfter),
        },
      }),
      ...(filters.bornBefore && {
        birthDate: {
          lte: new Date(filters.bornBefore),
        },
      }),
    };

    // Get total count
    const totalCount = await prisma.artist.count({ where });

    // Get artists with pagination
    const artists = await prisma.artist.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        updatedBy: {
          select: { id: true, name: true },
        },
        artworks: {
          select: {
            id: true,
            role: true,
            artwork: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    return Response.json({
      artists,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / filters.limit),
        hasMore: filters.page * filters.limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching artists:', error);
    return Response.json({ error: 'Failed to fetch artists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getRequiredUser();
    const body = await request.json();

    // Validate input
    const data = CreateArtistSchema.parse(body);

    // Create artist
    const artist = await prisma.artist.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        deathDate: data.deathDate ? new Date(data.deathDate) : null,
        biography: data.biography || null,
        createdById: user.id,
        updatedById: user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        updatedBy: {
          select: { id: true, name: true },
        },
        artworks: {
          select: {
            id: true,
            role: true,
            artwork: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
      },
    });

    return Response.json(artist, { status: 201 });
  } catch (error) {
    console.error('Error creating artist:', error);
    return Response.json({ error: 'Failed to create artist' }, { status: 500 });
  }
}
