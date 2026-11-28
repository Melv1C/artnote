import { cn } from '@/lib/utils';
import type { ArtworkStatus } from '@/schemas/common';
import { ARTWORK_STATUS } from '../../lib/artwork-status';

export function StatusDot({ status, className }: { status: ArtworkStatus; className?: string }) {
  return (
    <span
      className={cn('size-1.5 rounded-full', ARTWORK_STATUS[status].dotClassName, className)}
      aria-hidden="true"
    />
  );
}

export function StatusBadge({ status, className }: { status: ArtworkStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        className,
      )}
    >
      <StatusDot status={status} />
      {ARTWORK_STATUS[status].label}
    </span>
  );
}
