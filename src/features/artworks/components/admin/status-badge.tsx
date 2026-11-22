import { cn } from '@/lib/utils';
import type { ArtworkStatus } from '@/schemas/common';
import { ARTWORK_STATUS_LABELS } from '../../lib/artwork-status';

/** The colour of each status: published is live, a draft waits, an archive is put away. */
export const STATUS_DOT: Record<ArtworkStatus, string> = {
  PUBLISHED: 'bg-success',
  DRAFT: 'bg-warning',
  ARCHIVED: 'bg-muted-foreground/60',
};

export function StatusBadge({ status, className }: { status: ArtworkStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', STATUS_DOT[status])} aria-hidden="true" />
      {ARTWORK_STATUS_LABELS[status]}
    </span>
  );
}
