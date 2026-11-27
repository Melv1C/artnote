import { ArtworkStatusSchema, type ArtworkStatus } from '@/schemas/common';
import type { SortOrder } from './artwork-search';
import { ARTWORK_STATUS } from './artwork-status';

/** The sorts of the dashboard notices list, in the order the menu offers them. */
export const ADMIN_ARTWORK_SORTS = ['updatedAt', 'createdAt', 'title', 'viewCount'] as const;

export type AdminArtworkSort = (typeof ADMIN_ARTWORK_SORTS)[number];

/** What each sort is called, and what each of its directions puts first. */
export const ADMIN_ARTWORK_SORT_LABELS: Record<
  AdminArtworkSort,
  { label: string } & Record<SortOrder, string>
> = {
  updatedAt: {
    label: 'Dernière modification',
    desc: 'Plus récentes d’abord',
    asc: 'Plus anciennes d’abord',
  },
  createdAt: {
    label: 'Date de création',
    desc: 'Plus récentes d’abord',
    asc: 'Plus anciennes d’abord',
  },
  title: { label: 'Titre', asc: 'De A à Z', desc: 'De Z à A' },
  viewCount: {
    label: 'Nombre de vues',
    desc: 'Les plus vues d’abord',
    asc: 'Les moins vues d’abord',
  },
};

type StatusView = { id: 'current' | ArtworkStatus; label: string; statuses: ArtworkStatus[] };

/**
 * The status tabs above the list: what the writer is working on (the default, archives set aside
 * until asked for), then each status.
 */
export const ARTWORK_STATUS_VIEWS: StatusView[] = [
  { id: 'current', label: 'En cours', statuses: ['DRAFT', 'PUBLISHED'] },
  ...ArtworkStatusSchema.options.map(status => ({
    id: status,
    label: ARTWORK_STATUS[status].plural,
    statuses: [status],
  })),
];

export type ArtworkStatusView = StatusView['id'];

/** Filters of the dashboard notices list, applied in the browser. */
export type AdminArtworkFilter = {
  /** Chosen by the status tabs only */
  view: ArtworkStatusView;
  search: string;
  sortBy: AdminArtworkSort;
  sortOrder: SortOrder;
  /** `YYYY-MM-DD`, inclusive */
  createdAfter?: string;
  /** `YYYY-MM-DD`, inclusive */
  createdBefore?: string;
};

export const DEFAULT_ADMIN_ARTWORK_FILTER: AdminArtworkFilter = {
  view: 'current',
  search: '',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
};

type FilterableArtwork = {
  title: string;
  medium: string | null;
  creationYear: string | null;
  status: ArtworkStatus;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
};

/** Whether a notice shows under a status tab. */
export function inStatusView(view: ArtworkStatusView, status: ArtworkStatus): boolean {
  return Boolean(ARTWORK_STATUS_VIEWS.find(({ id }) => id === view)?.statuses.includes(status));
}

/** `text` in lower case without accents, so a search ignores both. */
const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

// A date-only string parses as UTC midnight; with a time it parses in the writer's own time zone
const startOfDay = (isoDate: string) => new Date(`${isoDate}T00:00:00`);
const endOfDay = (isoDate: string) => new Date(`${isoDate}T23:59:59.999`);

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
  const search = fold(filter.search.trim());
  const after = filter.createdAfter ? startOfDay(filter.createdAfter) : null;
  const before = filter.createdBefore ? endOfDay(filter.createdBefore) : null;
  const direction = filter.sortOrder === 'asc' ? 1 : -1;

  return artworks
    .filter(artwork => inStatusView(filter.view, artwork.status))
    .filter(
      artwork =>
        !search ||
        [artwork.title, artwork.medium, artwork.creationYear].some(
          field => field && fold(field).includes(search),
        ),
    )
    .filter(artwork => !after || artwork.createdAt >= after)
    .filter(artwork => !before || artwork.createdAt <= before)
    .toSorted((a, b) => {
      const [ka, kb] = [sortKey(a, filter.sortBy), sortKey(b, filter.sortBy)];
      return ka < kb ? -direction : ka > kb ? direction : 0;
    });
}

/**
 * How many of the "Filtres et tri" menu's settings differ from the defaults: the sort and the
 * creation dates. The status tab and the search show for themselves.
 */
export function countActiveFilters(filter: AdminArtworkFilter): number {
  const defaults = DEFAULT_ADMIN_ARTWORK_FILTER;
  return [
    filter.sortBy !== defaults.sortBy,
    filter.sortOrder !== defaults.sortOrder,
    Boolean(filter.createdAfter),
    Boolean(filter.createdBefore),
  ].filter(Boolean).length;
}
