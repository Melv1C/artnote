import { z } from 'zod';
import { ArtworkStatus } from '@/schemas';

export type ArtworkFilter = {
  search?: string;
  status?: ArtworkStatus[];
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
  createdAfter?: string;
  createdBefore?: string;
};

export type ArtworkSortOption = {
  value: ArtworkFilter['sortBy'];
  label: string;
};

// Default search parsing turns numeric values (e.g. `?year=1890`) into numbers, so accept both
// and keep the parsed value to avoid rewriting the URL
const searchValue = z.union([z.string(), z.number()]).optional().catch(undefined);

// Search params of the public artworks list (`/artworks`)
export const ArtworksSearchSchema = z.object({
  search: searchValue,
  artist: searchValue,
  place: searchValue,
  medium: searchValue,
  year: searchValue,
  sort: z.enum(['title', 'artist', 'year', 'published']).optional().catch(undefined),
  order: z.enum(['asc', 'desc']).optional().catch(undefined),
});

export type ArtworksSearch = z.infer<typeof ArtworksSearchSchema>;

/**
 * Filters for the artworks query, with every search value as a string.
 */
export const toArtworkFilters = ({
  search,
  artist,
  place,
  medium,
  year,
  sort,
  order,
}: ArtworksSearch) => {
  const str = (value: string | number | undefined) =>
    value === undefined ? undefined : String(value);
  return {
    search: str(search),
    artist: str(artist),
    place: str(place),
    medium: str(medium),
    year: str(year),
    sort,
    order,
  };
};
