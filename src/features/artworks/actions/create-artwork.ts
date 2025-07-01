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

export async function createArtwork(
  data: ArtworkForm
): Promise<CreateArtworkResponse> {
  try {
    // Get the current user session
    const user = await getRequiredUser();

    // Validate the form data
    const validatedData = ArtworkFormSchema.parse(data);

    // Create the artwork in the database with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the artwork
      const artwork = await tx.artwork.create({
        data: {
          title: validatedData.title,
          creationYear: validatedData.creationYear,
          medium: validatedData.medium,
          dimensions: validatedData.dimensions,
          notice: validatedData.notice,
          sources: validatedData.sources,
          status: validatedData.status,
          writerId: user.id,
          placeId: validatedData.placeId,
          // Initialize analytics fields
          viewCount: 0,
          lastViewedAt: null,
        },
      });

      // Create image associations if images are provided
      if (validatedData.images && validatedData.images.length > 0) {
        const imageAssociations = validatedData.images.map((imgData) => ({
          artworkId: artwork.id,
          imageId: imgData.imageId,
          sortOrder: imgData.sortOrder,
          isMain: imgData.isMain,
          source: imgData.source,
          createdById: user.id,
          updatedById: user.id,
        }));

        await tx.artworkImage.createMany({
          data: imageAssociations,
        });
      }

      return artwork;
    });

    return {
      success: true,
      data: ArtworkSchema.parse(result), // Return the created artwork data
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
