import type { Artwork } from '@/schemas/artwork';
import type { ArtworkStatus } from '@/schemas/common';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { ARTWORK_STATUS_LABELS } from '../../lib/artwork-status';
import { ArtworkCardAdmin } from './artwork-card-admin';

interface ArtworkCardWrapperProps {
  artwork: Artwork;
  onDelete: (artworkId: string) => Promise<void>;
  onStatusChange: (artworkId: string, status: ArtworkStatus) => Promise<void>;
}

/** A dashboard notice card wired to delete and status changes, with feedback toasts. */
export function ArtworkCardWrapper({ artwork, onDelete, onStatusChange }: ArtworkCardWrapperProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (artworkId: string) => {
    if (
      !confirm('Êtes-vous sûr de vouloir supprimer cette notice ? Cette action est irréversible.')
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await onDelete(artworkId);
        toast.success(`"${artwork.title}" a été supprimée`);
      } catch (error) {
        console.error('Deleting artwork failed:', error);
        toast.error('Erreur lors de la suppression de la notice');
      }
    });
  };

  const handleStatusChange = async (artworkId: string, status: ArtworkStatus) => {
    startTransition(async () => {
      try {
        await onStatusChange(artworkId, status);
        toast.success(`Statut changé : ${ARTWORK_STATUS_LABELS[status].toLowerCase()}`);
      } catch (error) {
        console.error('Changing artwork status failed:', error);
        toast.error('Erreur lors du changement de statut');
      }
    });
  };

  return (
    <ArtworkCardAdmin
      artwork={artwork}
      onDelete={handleDelete}
      onStatusChange={handleStatusChange}
      isPending={isPending}
    />
  );
}
