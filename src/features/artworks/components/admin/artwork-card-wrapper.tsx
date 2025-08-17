'use client';

import { Artwork } from '@/schemas';
import { useTransition } from 'react';
import { toast } from 'sonner';
import type { ArtworkActionResponse } from '../../actions/artwork-actions';
import { ArtworkCardAdmin } from './artwork-card-admin';

interface ArtworkCardWrapperProps {
  artwork: Artwork;
  onDelete: (artworkId: string) => Promise<ArtworkActionResponse>;
  onStatusChange?: (artworkId: string, status: string) => Promise<ArtworkActionResponse>;
}

export function ArtworkCardWrapper({ artwork, onDelete, onStatusChange }: ArtworkCardWrapperProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (artworkId: string) => {
    // Show confirmation dialog
    if (
      !confirm('Êtes-vous sûr de vouloir supprimer cette œuvre ? Cette action est irréversible.')
    ) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await onDelete(artworkId);

        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.error || 'Une erreur est survenue');
        }
      } catch (error) {
        console.error('Error deleting artwork:', error);
        toast.error('Une erreur inattendue est survenue');
      }
    });
  };

  const handleStatusChange = async (artworkId: string, status: string) => {
    if (!onStatusChange) return;

    startTransition(async () => {
      try {
        const result = await onStatusChange(artworkId, status);

        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.error || 'Une erreur est survenue');
        }
      } catch (error) {
        console.error('Error changing status:', error);
        toast.error('Une erreur inattendue est survenue');
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
