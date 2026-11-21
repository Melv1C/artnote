/**
 * StatCard: one figure of the dashboard, its label and an optional note.
 */

import { cn } from '@/lib/utils';
import { type StatCardProps } from './types';

export function StatCard({ title, value, icon: Icon, subtitle, tone }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground',
              tone === 'success' && 'bg-success/12 text-success',
              tone === 'warning' &&
                'bg-warning/15 text-[color-mix(in_oklab,var(--warning)_70%,var(--foreground))]',
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
        {typeof value === 'number' ? value.toLocaleString('fr-BE') : value}
      </p>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
