'use server';

import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import {
  Artwork,
  ArtworkFormSchema,
  ArtworkSchema,
  type ArtworkForm,
} from '@/schemas/artwork';

export type CreateArtworkResponse = {
  success: boolean;
  data?: Artwork;
  error?: string;
};

export async function createArtwork(data: ArtworkForm): Promise<CreateArtworkResponse> {
  try {
    // Get the current user session
    const user = await getRequiredUser();

    // Validate the form data
    const validatedData = ArtworkFormSchema.parse(data);

    // Create the artwork in the database
    const artwork = await prisma.artwork.create({
      data: {
        title: validatedData.title,
        creationYear: validatedData.creationYear || null,
        medium: validatedData.medium || null,
        dimensions: validatedData.dimensions || null,
        notice: validatedData.notice || null,
        sources: validatedData.sources || null,
        status: validatedData.status || 'DRAFT',
        writerId: user.id,
        placeId: validatedData.placeId || null,
        // Initialize analytics fields
        viewCount: 0,
        lastViewedAt: null,
      },
    });

    return {
      success: true,
      data: ArtworkSchema.parse(artwork), // Return the created artwork data
    };
  } catch (error) {
    console.error('Error creating artwork:', error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Une erreur inattendue s'est produite",
    };
  }
}
