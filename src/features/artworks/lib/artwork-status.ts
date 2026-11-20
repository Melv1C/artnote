import { ArtworkStatusSchema, type ArtworkStatus } from '@/schemas/common';

export const ARTWORK_STATUS_LABELS: Record<ArtworkStatus, string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  ARCHIVED: 'Archivé',
};

/**
 * `publishedAt` after a notice moves to `status`: a published notice keeps its first publication
 * date (or gets `now`), any other status clears it.
 */
export function nextPublishedAt(
  status: ArtworkStatus,
  previous: Date | null,
  now: Date = new Date(),
): Date | null {
  return status === ArtworkStatusSchema.enum.PUBLISHED ? (previous ?? now) : null;
}

/** Prisma `where` for notices visible to the public. */
export const publishedWhere = {
  status: ArtworkStatusSchema.enum.PUBLISHED,
  publishedAt: { not: null },
} as const;

/**
 * Prisma `where` for the notices a writer may read and change in the dashboard: their own.
 * Every dashboard notice query and mutation goes through it.
 */
export const ownedBy = (writerId: string, artworkId?: string) => ({
  writerId,
  ...(artworkId !== undefined && { id: artworkId }),
});
