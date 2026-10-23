import type { fetchFilteredArtworks } from '@/features/artworks/actions';
import { use } from 'react';
import { ArtworkCard } from './artwork-card';

interface ArtworksListProps {
  artworksPromise: ReturnType<typeof fetchFilteredArtworks>;
}

export function ArtworksList({ artworksPromise }: ArtworksListProps) {
  const artworks = use(artworksPromise);

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-2">Aucune œuvre trouvée</h3>
          <p className="text-muted-foreground mb-4">
            Essayez d'ajuster vos critères de recherche ou supprimez certains filtres.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {artworks.length} œuvre{artworks.length > 1 ? 's' : ''} trouvée
        {artworks.length > 1 ? 's' : ''}
      </div>

      {/* Artworks Grid */}
      <div className="flex flex-col gap-6">
        {artworks.map(artwork => (
          <ArtworkCard key={artwork.id} artwork={artwork} />
        ))}
      </div>
    </div>
  );
}
