import { LatestArtworkCard } from '@/components/artworks/latest-artwork-card';
import { getFilteredArtworks } from '@/lib/artworks';

interface ArtworksListProps {
  searchParams: Promise<{
    search?: string;
    artist?: string;
    place?: string;
    medium?: string;
    year?: string;
    sort?: 'title' | 'artist' | 'year' | 'published';
    order?: 'asc' | 'desc';
  }>;
}

export async function ArtworksList({ searchParams }: ArtworksListProps) {
  const resolvedSearchParams = await searchParams;
  const artworks = await getFilteredArtworks(resolvedSearchParams);

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
          <LatestArtworkCard key={artwork.id} artwork={artwork} />
        ))}
      </div>
    </div>
  );
}
