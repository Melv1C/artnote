import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ArtworksListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Artworks list skeleton */}
      <div className="flex flex-col gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden border-0 shadow-md bg-card flex flex-row">
            {/* Image skeleton */}
            <div className="relative w-1/3 min-w-[180px]">
              <Skeleton className="h-48 w-full" />
            </div>

            {/* Content skeleton */}
            <CardContent className="p-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Title skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>

                {/* Details skeleton */}
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>

              {/* Writer & publication info skeleton */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
