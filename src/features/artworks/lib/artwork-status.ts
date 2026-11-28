import { ArtworkStatusSchema, type ArtworkStatus } from '@/schemas/common';

interface StatusVocabulary {
  /** One notice in this status ("une notice publiée": feminine) */
  label: string;
  /** Several of them, for tabs and figures */
  plural: string;
  /** Moving a notice to this status, in the writer's menu */
  action: string;
  /** The confirmation once it moved */
  done: string;
  /** The colour of its dot: published is live, a draft waits, an archive is put away */
  dotClassName: string;
}

/** How the dashboard and the preview name and show each status. */
export const ARTWORK_STATUS: Record<ArtworkStatus, StatusVocabulary> = {
  DRAFT: {
    label: 'Brouillon',
    plural: 'Brouillons',
    action: 'Repasser en brouillon',
    done: 'Notice repassée en brouillon',
    dotClassName: 'bg-warning',
  },
  PUBLISHED: {
    label: 'Publiée',
    plural: 'Publiées',
    action: 'Publier',
    done: 'Notice publiée',
    dotClassName: 'bg-success',
  },
  ARCHIVED: {
    label: 'Archivée',
    plural: 'Archivées',
    action: 'Archiver',
    done: 'Notice archivée',
    dotClassName: 'bg-muted-foreground/60',
  },
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
