import type { Prisma } from '@/generated/prisma/client';
import { containsInsensitive as contains } from '@/lib/prisma-filters';
import { SearchTextSchema } from '@/schemas/common';
import { publishedWhere } from './artwork-status';
import { z } from '@/lib/zod';

const ArtworkSortSchema = z.enum(['title', 'artist', 'year', 'published']);
const SortOrderSchema = z.enum(['asc', 'desc']);

// Default search parsing turns numeric values (e.g. `?year=1890`) into numbers, so accept both
// and keep the parsed value to avoid rewriting the URL
const searchValue = z.union([z.string(), z.number()]).optional().catch(undefined);

/** Search params of the public notices list (`/artworks`). Invalid values are dropped. */
export const ArtworksSearchSchema = z.object({
  search: searchValue,
  artist: searchValue,
  place: searchValue,
  medium: searchValue,
  year: searchValue,
  sort: ArtworkSortSchema.optional().catch(undefined),
  order: SortOrderSchema.optional().catch(undefined),
});

export type ArtworksSearch = z.infer<typeof ArtworksSearchSchema>;

/** Input of `fetchFilteredArtworks`: every filter as a bounded string. */
export const ArtworkFiltersSchema = z.object({
  search: SearchTextSchema.optional(),
  artist: SearchTextSchema.optional(),
  place: SearchTextSchema.optional(),
  medium: SearchTextSchema.optional(),
  year: SearchTextSchema.optional(),
  sort: ArtworkSortSchema.default('title'),
  order: SortOrderSchema.default('asc'),
});

export type ArtworkFilters = z.input<typeof ArtworkFiltersSchema>;

const str = (value: string | number | undefined) =>
  value === undefined ? undefined : String(value);

/** Turn URL search params into query filters. */
export const toArtworkFilters = (search: ArtworksSearch): ArtworkFilters => ({
  search: str(search.search),
  artist: str(search.artist),
  place: str(search.place),
  medium: str(search.medium),
  year: str(search.year),
  sort: search.sort,
  order: search.order,
});

const artistNamed = (name: string): Prisma.ArtworkWhereInput => ({
  artists: {
    some: {
      OR: [{ artist: { firstName: contains(name) } }, { artist: { lastName: contains(name) } }],
    },
  },
});

/** Prisma `where` for published notices matching `filters`. */
export function buildArtworkWhere(
  filters: z.output<typeof ArtworkFiltersSchema>,
): Prisma.ArtworkWhereInput {
  const { search, artist, place, medium, year } = filters;
  return {
    ...publishedWhere,
    AND: [
      search
        ? {
            OR: [
              { title: contains(search) },
              artistNamed(search),
              { medium: contains(search) },
              { notice: contains(search) },
            ],
          }
        : {},
      artist ? artistNamed(artist) : {},
      place ? { place: { name: contains(place) } } : {},
      medium ? { medium: contains(medium) } : {},
      year ? { creationYear: contains(year) } : {},
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
export function sortByFirstArtist<T extends WithArtists>(artworks: T[], order: 'asc' | 'desc') {
  const name = (artwork: T) => {
    const first = artwork.artists[0]?.artist;
    return first ? `${first.firstName} ${first.lastName}` : '';
  };
  const direction = order === 'desc' ? -1 : 1;
  return artworks.toSorted(
    (a, b) => direction * name(a).localeCompare(name(b), 'fr', { sensitivity: 'base' }),
  );
}
