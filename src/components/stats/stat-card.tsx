/**
 * StatCard Component
 *
 * Reusable card component for displaying statistics with an icon and optional subtitle.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCardProps } from './types';

export function StatCard({ title, value, icon: Icon, subtitle }: StatCardProps) {
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
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
