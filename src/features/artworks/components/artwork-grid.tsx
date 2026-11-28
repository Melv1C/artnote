import { Skeleton } from '@/components/ui/skeleton';
import type { PublicArtwork } from '@/schemas/artwork';
import { ArtworkCard } from './artwork-card';

const GRID = 'grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3';

/** Notices as cards, one to three a row. The first two cards, at the top, load their image at once. */
export function ArtworkGrid({ artworks }: { artworks: PublicArtwork[] }) {
  return (
    <ul className={GRID}>
      {artworks.map((artwork, index) => (
        <li key={artwork.id}>
          <ArtworkCard artwork={artwork} priority={index < 2} />
        </li>
      ))}
    </ul>
  );
}

export function ArtworkGridSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement des notices">
      <Skeleton className="mb-6 h-4 w-32" />
      <div className={GRID}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <div className="space-y-2 px-1 pt-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
