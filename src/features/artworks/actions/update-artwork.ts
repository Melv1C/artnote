'use server';

import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import {
  ArtworkFormSchema,
  ArtworkSchema,
  type ArtworkForm,
} from '@/schemas/artwork';

export type UpdateArtworkResponse = {
  success: boolean;
  data?: typeof ArtworkSchema._type;
  error?: string;
};

export async function updateArtwork(
  artworkId: string,
  data: ArtworkForm
): Promise<UpdateArtworkResponse> {
  try {
    const user = await getRequiredUser();
    const validatedData = ArtworkFormSchema.parse(data);

    const existingArtwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      select: { writerId: true },
    });

    if (!existingArtwork) {
      return { success: false, error: 'Œuvre non trouvée' };
    }

    if (existingArtwork.writerId !== user.id) {
      return { success: false, error: 'Non autorisé' };
    }

    // Update artwork with transaction to handle image associations
    const result = await prisma.$transaction(async (tx) => {
      // Update the artwork
      const updatedArtwork = await tx.artwork.update({
        where: { id: artworkId },
        data: {
          title: validatedData.title,
          creationYear: validatedData.creationYear || null,
          medium: validatedData.medium || null,
          dimensions: validatedData.dimensions || null,
          notice: validatedData.notice || null,
          sources: validatedData.sources || null,
          status: validatedData.status,
          placeId: validatedData.placeId || null,
        },
      });

      // Handle image associations if images are provided
      if (validatedData.images !== undefined) {
        // Delete existing image associations
        await tx.artworkImage.deleteMany({
          where: { artworkId: artworkId },
        });

        // Create new image associations
        if (validatedData.images.length > 0) {
          const imageAssociations = validatedData.images.map((imgData) => ({
            artworkId: artworkId,
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
      }

      return updatedArtwork;
    });

    return { success: true, data: ArtworkSchema.parse(result) };
  } catch (error) {
    console.error('Error updating artwork:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Une erreur inattendue s'est produite" };
  }
}
