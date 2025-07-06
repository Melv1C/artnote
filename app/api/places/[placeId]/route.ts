'use server';

import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  try {
    // Check authentication
    await getRequiredUser();

    const place = await prisma.place.findUnique({
      where: { id: params.placeId },
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
    });

    if (!place) {
      return Response.json({ error: 'Place not found' }, { status: 404 });
    }

    return Response.json(place);
  } catch (error) {
    console.error('Error fetching place:', error);
    return Response.json({ error: 'Failed to fetch place' }, { status: 500 });
  }
}
