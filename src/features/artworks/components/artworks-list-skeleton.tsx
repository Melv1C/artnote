import { Skeleton } from '@/components/ui/skeleton';

export function ArtworksListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-label="Chargement des notices">
      <Skeleton className="mb-6 h-4 w-32" />
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
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
