import type { ArtworkStatus } from '@/schemas/common';

/** Filters of the dashboard notices list, applied in the browser. */
export type AdminArtworkFilter = {
  search?: string;
  status?: ArtworkStatus[];
  sortBy?: AdminArtworkSort;
  sortOrder?: 'asc' | 'desc';
  /** `YYYY-MM-DD`, inclusive */
  createdAfter?: string;
  /** `YYYY-MM-DD`, inclusive */
  createdBefore?: string;
};

export type AdminArtworkSort = 'title' | 'createdAt' | 'updatedAt' | 'viewCount';

/** Drafts and published notices; archived ones are hidden until asked for. */
export const DEFAULT_ADMIN_ARTWORK_FILTER: AdminArtworkFilter = { status: ['DRAFT', 'PUBLISHED'] };

type FilterableArtwork = {
  title: string;
  medium: string | null;
  creationYear: string | null;
  status: ArtworkStatus;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
};

const endOfDay = (isoDate: string) => {
  const date = new Date(isoDate);
  date.setHours(23, 59, 59, 999);
  return date;
};

const sortKey = (artwork: FilterableArtwork, sortBy: AdminArtworkSort): string | number => {
  switch (sortBy) {
    case 'title':
      return artwork.title.toLowerCase();
    case 'createdAt':
      return artwork.createdAt.getTime();
    case 'updatedAt':
      return artwork.updatedAt.getTime();
    case 'viewCount':
      return artwork.viewCount;
    default: {
      const exhaustive: never = sortBy;
      return exhaustive;
    }
  }
};

/** Apply the dashboard filters and sort to the writer's notices. Returns a new array. */
export function filterAdminArtworks<T extends FilterableArtwork>(
  artworks: T[],
  filter: AdminArtworkFilter,
): T[] {
  const search = filter.search?.trim().toLowerCase();
  const after = filter.createdAfter ? new Date(filter.createdAfter) : null;
  const before = filter.createdBefore ? endOfDay(filter.createdBefore) : null;
  const sortBy = filter.sortBy ?? 'updatedAt';
  const direction = (filter.sortOrder ?? 'desc') === 'asc' ? 1 : -1;

  return artworks
    .filter(artwork => !filter.status?.length || filter.status.includes(artwork.status))
    .filter(
      artwork =>
        !search ||
        [artwork.title, artwork.medium, artwork.creationYear].some(field =>
          field?.toLowerCase().includes(search),
        ),
    )
    .filter(artwork => !after || artwork.createdAt >= after)
    .filter(artwork => !before || artwork.createdAt <= before)
    .toSorted((a, b) => {
      const [ka, kb] = [sortKey(a, sortBy), sortKey(b, sortBy)];
      return ka < kb ? -direction : ka > kb ? direction : 0;
    });
}

/** How many filters differ from the defaults (search excluded: it has its own input). */
export function countActiveFilters(filter: AdminArtworkFilter): number {
  const statusIsDefault =
    !filter.status?.length ||
    (filter.status.length === 2 &&
      filter.status.includes('DRAFT') &&
      filter.status.includes('PUBLISHED'));
  return [
    !statusIsDefault,
    filter.sortBy !== undefined && filter.sortBy !== 'updatedAt',
    filter.sortOrder !== undefined && filter.sortOrder !== 'desc',
    !!filter.createdAfter,
    !!filter.createdBefore,
  ].filter(Boolean).length;
}
