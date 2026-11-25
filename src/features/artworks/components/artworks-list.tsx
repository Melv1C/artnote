import { Button } from '@/components/ui/button';
import type { fetchFilteredArtworks } from '@/features/artworks/actions/artwork-queries';
import { plural } from '@/lib/format';
import { Link } from '@tanstack/react-router';
import { SearchX } from 'lucide-react';
import { use, useDeferredValue, useMemo } from 'react';
import { ArtworkGrid } from './artwork-grid';

interface ArtworksListProps {
  artworksPromise: ReturnType<typeof fetchFilteredArtworks>;
  /** Whether a search narrowed the list, to word the empty state */
  isFiltered: boolean;
}

export function ArtworksList({ artworksPromise, isFiltered }: ArtworksListProps) {
  // A new search keeps the current cards on screen, dimmed, instead of the skeleton
  // The promise and whether it was filtered are deferred together, so the empty state words
  // the results on screen, not the search still loading
  const current = useMemo(() => ({ artworksPromise, isFiltered }), [artworksPromise, isFiltered]);
  const deferred = useDeferredValue(current);
  const artworks = use(deferred.artworksPromise);
  const isUpdating = deferred.artworksPromise !== artworksPromise;
  const count = plural(artworks.length, 'notice');

  return (
    <>
      {/* One live region for every result, so a screen reader hears each new count, zero included */}
      <p className="sr-only" role="status">
        {count}
      </p>
      <div
        aria-busy={isUpdating}
        className={isUpdating ? 'opacity-60 transition-opacity' : 'transition-opacity'}
      >
        {artworks.length === 0 ? (
          <EmptyResults isFiltered={deferred.isFiltered} />
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground" aria-hidden="true">
              {count}
            </p>
            <ArtworkGrid artworks={artworks} />
          </>
        )}
      </div>
    </>
  );
}

function EmptyResults({ isFiltered }: { isFiltered: boolean }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center py-16 text-center">
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
