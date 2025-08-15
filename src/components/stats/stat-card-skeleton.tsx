/**
 * StatCardSkeleton Component
 *
 * Loading skeleton for stat cards that maintains layout consistency during loading states.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCardSkeletonProps } from './types';

export function StatCardSkeleton({ title, icon: Icon }: StatCardSkeletonProps) {
  return (
    <Card>
      {' '}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  );
}
