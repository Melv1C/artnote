import { createFileRoute } from '@tanstack/react-router';
import { prisma } from '@/lib/prisma';
import { ArtworkStatusSchema } from '@/schemas';

async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Validate status if provided
    let validatedStatus: string | undefined;
    if (status) {
      const result = ArtworkStatusSchema.safeParse(status);
      if (!result.success) {
        return Response.json({ error: 'Invalid status parameter' }, { status: 400 });
      }
      validatedStatus = result.data;
    }

    const artworks = await prisma.artwork.findMany({
      where: validatedStatus ? { status: validatedStatus } : undefined,
      include: {
        writer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
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
      orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
      take: limit ? parseInt(limit, 10) : undefined,
      skip: offset ? parseInt(offset, 10) : undefined,
    });

    return Response.json(artworks);
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return Response.json({ error: 'Failed to fetch artworks' }, { status: 500 });
  }
}

export const Route = createFileRoute('/api/artworks/')({
  server: {
    handlers: {
      GET: ({ request }) => GET(request),
    },
  },
});
