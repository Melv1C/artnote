import type { ArtistFilters } from '@/schemas/artist';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchArtists } from '../actions/artist-queries';

const TABLE_PAGE_SIZE = 25;

/** React Query keys for artist reads. Invalidate `artistKeys.all` after any artist mutation. */
export const artistKeys = {
  all: ['artists'] as const,
  options: (search: string | undefined) => [...artistKeys.all, 'options', search] as const,
  list: (filters: ArtistFilters) => [...artistKeys.all, 'list', filters] as const,
};

export function useArtists(filters: ArtistFilters = {}) {
  return useQuery({
    queryKey: artistKeys.list(filters),
    queryFn: () => fetchArtists({ data: { limit: TABLE_PAGE_SIZE, ...filters } }),
    staleTime: 30 * 1000,
    // Keep the current page on screen while the next one loads
    placeholderData: keepPreviousData,
  });
}

const OPTIONS_LIMIT = 100;

/** Artists matching `search`, for the notice editor's artist picker. */
export function useArtistOptions(search?: string) {
  return useQuery({
    queryKey: artistKeys.options(search),
    queryFn: async () => (await fetchArtists({ data: { search, limit: OPTIONS_LIMIT } })).artists,
    staleTime: 5 * 60 * 1000,
  });
}
