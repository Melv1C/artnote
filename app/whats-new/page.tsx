import { ArtworkCard } from '@/features/artworks';
import { getLatestPublishedArtworks } from '@/features/artworks/actions';

export const metadata = {
  title: 'Nouveautés - ArtNote',
};

export default async function WhatsNewPage() {
  const latestArtworks = await getLatestPublishedArtworks(12);

  return (
    <div className="container py-8">
      {/* Page Header */}
      <div className="max-w-2xl mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Nouveautés</h1>
        <p className="text-lg text-muted-foreground">
          Découvrez les dernières notices d'œuvres d'art publiées par nos rédacteurs experts.
        </p>
      </div>

      {/* Artworks List */}
      {latestArtworks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Aucune notice publiée récemment.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {latestArtworks.map(artwork => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      )}
    </div>
  );
}
