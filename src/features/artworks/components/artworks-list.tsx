import { Button } from '@/components/ui/button';
import type { fetchFilteredArtworks } from '@/features/artworks/actions/artwork-queries';
import { Link } from '@tanstack/react-router';
import { SearchX } from 'lucide-react';
import { use, useDeferredValue } from 'react';
import { ArtworkCard } from './artwork-card';

interface ArtworksListProps {
  artworksPromise: ReturnType<typeof fetchFilteredArtworks>;
  /** Whether a search narrowed the list, to word the empty state */
  isFiltered: boolean;
}

export function ArtworksList({ artworksPromise, isFiltered }: ArtworksListProps) {
  // A new search keeps the current cards on screen, dimmed, instead of the skeleton
  const deferred = useDeferredValue(artworksPromise);
  const artworks = use(deferred);
  const isUpdating = deferred !== artworksPromise;

  if (artworks.length === 0) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center py-16 text-center">
        <p className="sr-only" role="status">
          0 notice
        </p>
        <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <SearchX className="size-6" aria-hidden="true" />
        </div>
        <h2 className="font-serif text-2xl font-medium">
          {isFiltered ? 'Aucune notice ne correspond' : 'Aucune notice publiée'}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {isFiltered
            ? 'Vérifiez l’orthographe, ou cherchez un artiste ou un musée.'
            : 'Les premières notices arrivent bientôt.'}
        </p>
        {isFiltered && (
          <Button asChild variant="outline" className="mt-6 rounded-full">
            <Link to="/artworks" search={{}}>
              Voir toutes les notices
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      aria-busy={isUpdating}
      className={isUpdating ? 'opacity-60 transition-opacity' : 'transition-opacity'}
    >
      <p className="mb-6 text-sm text-muted-foreground" role="status">
        {artworks.length} notice{artworks.length > 1 ? 's' : ''}
      </p>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {artworks.map((artwork, index) => (
          <li key={artwork.id}>
            <ArtworkCard artwork={artwork} priority={index < 2} />
          </li>
        ))}
      </ul>
    </div>
  );
}
