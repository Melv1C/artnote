/**
 * StatCardSkeleton: a stat card while its figure loads, the same size as the card.
 */

import { Skeleton } from '@/components/ui/skeleton';
import { type StatCardSkeletonProps } from './types';

export function StatCardSkeleton({ title, icon: Icon }: StatCardSkeletonProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs" aria-busy="true">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <Skeleton className="mt-3 h-9 w-16" />
    </div>
  );
}
