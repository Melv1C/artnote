import { getUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { ArtworkSchema, ArtworkStatusSchema, UserSchema } from '@/schemas';
import { notFound } from 'next/navigation';

export async function getArtworkById(id: string) {
  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id },
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
    });

    if (!artwork || artwork.status !== ArtworkStatusSchema.enum.PUBLISHED) {
      return null;
    }

    return ArtworkSchema.extend({
      writer: UserSchema,
    }).parse(artwork);
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return null;
  }
}

export async function getArtworkByIdForPreview(id: string) {
  try {
    const user = await getUser();

    const artwork = await prisma.artwork.findUnique({
      where: { id },
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
    });

    if (!artwork || !user) {
      return null;
    }

    const isWriter = artwork.writerId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isWriter && !isAdmin) {
      return null;
    }

    return ArtworkSchema.extend({
      writer: UserSchema,
    }).parse(artwork);
  } catch (error) {
    console.error('Error fetching artwork for preview:', error);
    notFound();
  }
}
