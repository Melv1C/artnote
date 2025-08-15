'use server';

import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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

/**
 * Change artwork status
 */
export async function changeArtworkStatus(artworkId: string, newStatus: string) {
  try {
    // Verify user is authenticated
    const user = await getRequiredUser();

    // Validate the status
    const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
    if (!validStatuses.includes(newStatus)) {
      return { success: false, error: 'Statut invalide' };
    }

    // Get the artwork to check ownership
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      select: { id: true, writerId: true, title: true, status: true },
    });

    if (!artwork) {
      return { success: false, error: 'Œuvre non trouvée' };
    }

    // Check if user owns this artwork
    if (artwork.writerId !== user.id) {
      return { success: false, error: 'Non autorisé' };
    }

    // Update the artwork status
    await prisma.artwork.update({
      where: { id: artworkId },
      data: {
        status: newStatus,
        publishedAt: newStatus === 'PUBLISHED' ? new Date() : null,
        updatedAt: new Date(),
      },
    });

    // Revalidate the artworks page to show updated data
    revalidatePath('/dashboard/artworks');

    const statusLabels = {
      DRAFT: 'brouillon',
      PUBLISHED: 'publié',
      ARCHIVED: 'archivé',
    };

    return {
      success: true,
      message: `Statut changé vers "${statusLabels[newStatus as keyof typeof statusLabels]}"`,
    };
  } catch (error) {
    console.error('Error changing artwork status:', error);
    return { success: false, error: 'Une erreur est survenue' };
  }
}

export type ArtworkActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};
