'use server';

import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { ArtworkStatusSchema } from '@/schemas';
import { ArtworkFormSchema, type ArtworkForm } from '@/schemas/artwork';

export type CreateArtworkResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function createArtwork(data: ArtworkForm): Promise<CreateArtworkResponse> {
  try {
    // Get the current user session
    const user = await getRequiredUser();

    // Validate the form data
    const validatedData = ArtworkFormSchema.parse(data);

    // Create the artwork in the database with transaction
    await prisma.$transaction(async tx => {
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
          publishedAt:
            validatedData.status === ArtworkStatusSchema.Values.PUBLISHED ? new Date() : null,
          writerId: user.id,
          placeId: validatedData.placeId || null,
          // Initialize analytics fields
          viewCount: 0,
          lastViewedAt: null,
        },
      });

      // Create image associations if images are provided
      if (validatedData.images && validatedData.images.length > 0) {
        const imageAssociations = validatedData.images.map(imgData => ({
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

      // Create artist associations if artistIds provided
      if (validatedData.artistIds && validatedData.artistIds.length > 0) {
        const artistAssociations = validatedData.artistIds.map(artistId => ({
          artworkId: artwork.id,
          artistId,
          role: null, // TODO: role selection not implemented yet
        }));
        await tx.artworkArtist.createMany({ data: artistAssociations });
      }

      return artwork;
    });

    return {
      success: true,
      message: 'Artwork created successfully',
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
