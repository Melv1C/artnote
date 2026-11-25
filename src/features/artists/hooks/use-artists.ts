import type { ArtistFilters } from '@/schemas/artist';
import { MAX_PAGE_SIZE } from '@/lib/pagination';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchArtists } from '../actions/artist-queries';

/** React Query keys for artist reads. Invalidate `artistKeys.all` after any artist mutation. */
export const artistKeys = {
  all: ['artists'] as const,
  options: (search: string | undefined) => [...artistKeys.all, 'options', search] as const,
  list: (filters: ArtistFilters) => [...artistKeys.all, 'list', filters] as const,
};

export function useArtists(filters: ArtistFilters = {}) {
  return useQuery({
    queryKey: artistKeys.list(filters),
    queryFn: () => fetchArtists({ data: filters }),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

/** Artists matching `search`, for the notice editor's artist picker. */
export function useArtistOptions(search?: string) {
  return useQuery({
    queryKey: artistKeys.options(search),
    queryFn: async () => (await fetchArtists({ data: { search, limit: MAX_PAGE_SIZE } })).artists,
    staleTime: 5 * 60 * 1000,
  });
}
