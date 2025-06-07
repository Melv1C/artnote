'use server';

import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Archive or unarchive an artwork
 */
export async function toggleArchiveArtwork(artworkId: string) {
  try {
    // Verify user is authenticated
    const user = await getRequiredUser();

    // Get the current artwork to check ownership and current status
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      select: { id: true, status: true, writerId: true },
    });

    if (!artwork) {
      return { success: false, error: 'Œuvre non trouvée' };
    }

    // Check if user owns this artwork
    if (artwork.writerId !== user.id) {
      return { success: false, error: 'Non autorisé' };
    }

    // Toggle between ARCHIVED and the previous status (DRAFT/PUBLISHED)
    const newStatus =
      artwork.status === 'ARCHIVED'
        ? 'DRAFT' // Default to DRAFT when unarchiving
        : 'ARCHIVED';

    // Update the artwork status
    await prisma.artwork.update({
      where: { id: artworkId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    // Revalidate the artworks page to show updated data
    revalidatePath('/dashboard/artworks');

    return {
      success: true,
      message:
        newStatus === 'ARCHIVED' ? 'Œuvre archivée' : 'Œuvre désarchivée',
    };
  } catch (error) {
    console.error('Error toggling artwork archive status:', error);
    return { success: false, error: 'Une erreur est survenue' };
  }
}

/**
 * Delete an artwork permanently
 */
export async function deleteArtwork(artworkId: string) {
  try {
    // Verify user is authenticated
    const user = await getRequiredUser();

    // Get the artwork to check ownership
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      select: { id: true, writerId: true, title: true },
    });

    if (!artwork) {
      return { success: false, error: 'Œuvre non trouvée' };
    }

    // Check if user owns this artwork
    if (artwork.writerId !== user.id) {
      return { success: false, error: 'Non autorisé' };
    }

    // Delete the artwork (this will cascade delete related records due to Prisma schema)
    await prisma.artwork.delete({
      where: { id: artworkId },
    });

    // Revalidate the artworks page to show updated data
    revalidatePath('/dashboard/artworks');

    return {
      success: true,
      message: `"${artwork.title}" a été supprimée`,
    };
  } catch (error) {
    console.error('Error deleting artwork:', error);
    return {
      success: false,
      error: 'Une erreur est survenue lors de la suppression',
    };
  }
}

export type ArtworkActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};
