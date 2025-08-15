'use server';

import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { UpdateArtistSchema } from '@/schemas/artist';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ artistId: string }> },
) {
  try {
    // Check authentication
    await getRequiredUser();

    // Await the params promise
    const { artistId } = await params;

    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
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

    if (!artist) {
      return Response.json({ error: 'Artist not found' }, { status: 404 });
    }

    return Response.json(artist);
  } catch (error) {
    console.error('Error fetching artist:', error);
    return Response.json({ error: 'Failed to fetch artist' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ artistId: string }> },
) {
  try {
    const user = await getRequiredUser();
    const { artistId } = await params;
    const body = await request.json();

    // Validate input
    const data = UpdateArtistSchema.parse(body);

    // Update artist
    const artist = await prisma.artist.update({
      where: { id: artistId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.birthDate !== undefined && {
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
        }),
        ...(data.deathDate !== undefined && {
          deathDate: data.deathDate ? new Date(data.deathDate) : null,
        }),
        ...(data.biography !== undefined && { biography: data.biography }),
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

    return Response.json(artist);
  } catch (error) {
    console.error('Error updating artist:', error);
    return Response.json({ error: 'Failed to update artist' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ artistId: string }> },
) {
  try {
    await getRequiredUser();
    const { artistId } = await params;

    await prisma.artist.delete({
      where: { id: artistId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting artist:', error);
    return Response.json({ error: 'Failed to delete artist' }, { status: 500 });
  }
}
