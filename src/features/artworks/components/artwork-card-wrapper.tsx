'use client';

import { Artwork } from '@/schemas';
import { useTransition } from 'react';
import { toast } from 'sonner';
import type { ArtworkActionResponse } from '../actions/artwork-actions';
import { ArtworkCard } from './artwork-card';

interface ArtworkCardWrapperProps {
  artwork: Artwork;
  onArchiveToggle: (artworkId: string) => Promise<ArtworkActionResponse>;
  onDelete: (artworkId: string) => Promise<ArtworkActionResponse>;
}

export function ArtworkCardWrapper({
  artwork,
  onArchiveToggle,
  onDelete,
}: ArtworkCardWrapperProps) {
  const [isPending, startTransition] = useTransition();

  const handleArchiveToggle = async (artworkId: string) => {
    startTransition(async () => {
      try {
        const result = await onArchiveToggle(artworkId);

        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.error || 'Une erreur est survenue');
        }
      } catch (error) {
        console.error('Error toggling archive status:', error);
        toast.error('Une erreur inattendue est survenue');
      }
    });
  };

  const handleDelete = async (artworkId: string) => {
    // Show confirmation dialog
    if (
      !confirm(
        'Êtes-vous sûr de vouloir supprimer cette œuvre ? Cette action est irréversible.'
      )
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

  return (
    <ArtworkCard
      artwork={artwork}
      onArchiveToggle={handleArchiveToggle}
      onDelete={handleDelete}
      isPending={isPending}
    />
  );
}
