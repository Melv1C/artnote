import { artistFullName } from '@/features/artists/lib/artist-name';
import type { Prisma } from '@/generated/prisma/client';
import { SearchTextSchema } from '@/schemas/common';
import { publishedWhere } from './artwork-status';
import { z } from '@/lib/zod';

export const ArtworkSortSchema = z.enum(['title', 'artist', 'year', 'published']);
export const SortOrderSchema = z.enum(['asc', 'desc']);

export type ArtworkSort = z.infer<typeof ArtworkSortSchema>;
export type SortOrder = z.infer<typeof SortOrderSchema>;

/** The public list's order when the URL gives none. */
export const DEFAULT_ARTWORK_SORT = { sort: 'title', order: 'asc' } as const satisfies {
  sort: ArtworkSort;
  order: SortOrder;
};

// Default search parsing turns numeric values (e.g. `?search=1890`) into numbers, so accept both
// and keep the parsed value to avoid rewriting the URL. Over-long values are dropped, not errors.
const searchValue = z
  .union([z.string().max(200), z.number()])
  .optional()
  .catch(undefined);

/** Search params of the public notices list (`/artworks`). Invalid values are dropped. */
export const ArtworksSearchSchema = z.object({
  search: searchValue,
  /** A place's exact name, set by the map's "Voir les N notices" link */
  place: searchValue,
  sort: ArtworkSortSchema.optional().catch(undefined),
  order: SortOrderSchema.optional().catch(undefined),
});

export type ArtworksSearch = z.infer<typeof ArtworksSearchSchema>;

/** Input of `fetchFilteredArtworks`: every filter as a bounded string. */
export const ArtworkFiltersSchema = z.object({
  search: SearchTextSchema.optional(),
  place: SearchTextSchema.optional(),
  sort: ArtworkSortSchema.default(DEFAULT_ARTWORK_SORT.sort),
  order: SortOrderSchema.default(DEFAULT_ARTWORK_SORT.order),
});

export type ArtworkFilters = z.input<typeof ArtworkFiltersSchema>;

const str = (value: string | number | undefined) =>
  value === undefined ? undefined : String(value);

export const toArtworkFilters = (search: ArtworksSearch): ArtworkFilters => ({
  search: str(search.search),
  place: str(search.place),
  sort: search.sort,
  order: search.order,
});

/** Ids of the rows the search matches, from `idsContaining`; `undefined` without a search. */
export type ArtworkSearchIds = {
  /** Notices whose title, medium or text contains the search */
  artworks?: string[];
  /** Artists whose first or last name contains it */
  artists?: string[];
  /** Places whose name contains it */
  places?: string[];
};

/** Prisma `where` for published notices matching `filters`, given the rows the search matches. */
export function buildArtworkWhere(
  { place }: z.output<typeof ArtworkFiltersSchema>,
  found: ArtworkSearchIds,
): Prisma.ArtworkWhereInput {
  return {
    ...publishedWhere,
    AND: [
      found.artworks
        ? {
            OR: [
              { id: { in: found.artworks } },
              { artists: { some: { artistId: { in: found.artists ?? [] } } } },
              { placeId: { in: found.places ?? [] } },
            ],
          }
        : {},
      place ? { place: { name: { equals: place, mode: 'insensitive' } } } : {},
    ],
  };
}

/**
 * Prisma `orderBy` for a sort. Sorting by artist happens after the query
 * (see `sortByFirstArtist`), so the database only orders by title.
 */
export function buildArtworkOrderBy(
  filters: z.output<typeof ArtworkFiltersSchema>,
): Prisma.ArtworkOrderByWithRelationInput[] {
  const { sort, order } = filters;
  switch (sort) {
    case 'title':
    case 'artist':
      return [{ title: sort === 'title' ? order : 'asc' }];
    case 'year':
      return [{ creationYear: order }, { title: 'asc' }];
    case 'published':
      return [{ publishedAt: order }, { title: 'asc' }];
    default: {
      const exhaustive: never = sort;
      return exhaustive;
    }
  }
}

type WithArtists = { artists: { artist: { firstName: string; lastName: string } }[] };

/** Sort notices by their first artist's full name, French collation. Stable for ties. */
export function sortByFirstArtist<T extends WithArtists>(artworks: T[], order: SortOrder) {
  const name = (artwork: T) => {
    const first = artwork.artists[0]?.artist;
    return first ? artistFullName(first) : '';
  };
  const direction = order === 'desc' ? -1 : 1;
  return artworks.toSorted(
    (a, b) => direction * name(a).localeCompare(name(b), 'fr', { sensitivity: 'base' }),
  );
}
