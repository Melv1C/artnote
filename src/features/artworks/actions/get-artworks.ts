import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { ArtworkSchema, ArtworkStatusSchema, UserSchema } from '@/schemas';

export async function getLatestPublishedArtworks(limit: number = 6) {
  try {
    const artworks = await prisma.artwork.findMany({
      where: {
        status: ArtworkStatusSchema.Values.PUBLISHED,
        publishedAt: {
          not: null,
        },
      },
      include: {
        writer: true,
        place: true,
        artists: {
          include: {
            artist: true,
          },
        },
        images: {
          include: {
            image: true,
          },
          orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }],
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: limit,
    });

    return ArtworkSchema.extend({
      writer: UserSchema,
    })
      .array()
      .parse(artworks);
  } catch (error) {
    console.error('Error fetching latest published artworks:', error);
    return [];
  }
}

export interface ArtworkFilters {
  search?: string;
  artist?: string;
  place?: string;
  medium?: string;
  year?: string;
  sort?: 'title' | 'artist' | 'year' | 'published';
  order?: 'asc' | 'desc';
}

export async function getFilteredArtworks(filters: ArtworkFilters = {}) {
  try {
    const { search, artist, place, medium, year, sort = 'title', order = 'asc' } = filters;

    // Build where clause
    const where: Prisma.ArtworkWhereInput = {
      status: 'PUBLISHED',
      publishedAt: {
        not: null,
      },
    };

    // Add search filters
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          artists: {
            some: {
              OR: [
                {
                  artist: {
                    firstName: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  artist: {
                    lastName: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
            },
          },
        },
        {
          medium: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          notice: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Add specific filters
    if (artist) {
      where.artists = {
        some: {
          OR: [
            {
              artist: {
                firstName: {
                  contains: artist,
                  mode: 'insensitive',
                },
              },
            },
            {
              artist: {
                lastName: {
                  contains: artist,
                  mode: 'insensitive',
                },
              },
            },
          ],
        },
      };
    }

    if (place) {
      where.place = {
        name: {
          contains: place,
          mode: 'insensitive',
        },
      };
    }

    if (medium) {
      where.medium = {
        contains: medium,
        mode: 'insensitive',
      };
    }

    if (year) {
      where.creationYear = {
        contains: year,
        mode: 'insensitive',
      };
    }

    // Build orderBy clause
    let orderBy: Prisma.ArtworkOrderByWithRelationInput | Prisma.ArtworkOrderByWithRelationInput[] =
      {};
    switch (sort) {
      case 'title':
        orderBy = { title: order };
        break;
      case 'artist':
        orderBy = {
          artists: {
            _count: order,
          },
        };
        // Fallback to title for consistent ordering
        if (!Array.isArray(orderBy)) {
          orderBy = [orderBy, { title: 'asc' }];
        }
        break;
      case 'year':
        orderBy = [{ creationYear: order }, { title: 'asc' }];
        break;
      case 'published':
        orderBy = [{ publishedAt: order }, { title: 'asc' }];
        break;
      default:
        orderBy = { title: 'asc' };
    }

    const artworks = await prisma.artwork.findMany({
      where,
      include: {
        writer: true,
        place: true,
        artists: {
          include: {
            artist: true,
          },
          orderBy: {
            artist: {
              lastName: 'asc',
            },
          },
        },
        images: {
          include: {
            image: true,
          },
          orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }],
        },
      },
      orderBy,
    });

    // For artist sorting, we need to sort manually since Prisma doesn't handle it well
    if (sort === 'artist') {
      artworks.sort((a, b) => {
        const artistA = a.artists[0]?.artist
          ? `${a.artists[0].artist.firstName} ${a.artists[0].artist.lastName}`
          : '';
        const artistB = b.artists[0]?.artist
          ? `${b.artists[0].artist.firstName} ${b.artists[0].artist.lastName}`
          : '';

        const comparison = artistA.localeCompare(artistB, 'fr', {
          sensitivity: 'base',
        });
        return order === 'desc' ? -comparison : comparison;
      });
    }

    return ArtworkSchema.extend({
      writer: UserSchema,
    })
      .array()
      .parse(artworks);
  } catch (error) {
    console.error('Error fetching filtered artworks:', error);
    return [];
  }
}
