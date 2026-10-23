import { createServerFn } from '@tanstack/react-start';
import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

/**
 * Delete an artwork permanently
 */
export const deleteArtwork = createServerFn({ method: 'POST' })
  .validator((artworkId: string) => artworkId)
  .handler(async ({ data: artworkId }) => {
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
  });

/**
 * Change artwork status
 */
export const changeArtworkStatus = createServerFn({ method: 'POST' })
  .validator((data: { artworkId: string; newStatus: string }) => data)
  .handler(async ({ data: { artworkId, newStatus } }) => {
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
        select: { id: true, writerId: true, title: true, status: true, publishedAt: true },
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
          publishedAt: newStatus === 'PUBLISHED' ? (artwork.publishedAt ?? new Date()) : null,
          updatedAt: new Date(),
        },
      });

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
  });

export type ArtworkActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};
