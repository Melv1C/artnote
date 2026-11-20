import type { PlaceFilters } from '@/schemas/place';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchPlaces } from '../actions/place-queries';

const TABLE_PAGE_SIZE = 25;

/** React Query keys for place reads. Invalidate `placeKeys.all` after any place mutation. */
export const placeKeys = {
  all: ['places'] as const,
  options: (search: string | undefined) => [...placeKeys.all, 'options', search] as const,
  list: (filters: PlaceFilters) => [...placeKeys.all, 'list', filters] as const,
};

export function usePlaces(filters: PlaceFilters = {}) {
  return useQuery({
    queryKey: placeKeys.list(filters),
    queryFn: () => fetchPlaces({ data: { limit: TABLE_PAGE_SIZE, ...filters } }),
    staleTime: 30 * 1000,
    // Keep the current page on screen while the next one loads
    placeholderData: keepPreviousData,
  });
}

const OPTIONS_LIMIT = 100;

/** Places matching `search`, for the notice editor's place picker. */
export function usePlaceOptions(search?: string) {
  return useQuery({
    queryKey: placeKeys.options(search),
    queryFn: async () => (await fetchPlaces({ data: { search, limit: OPTIONS_LIMIT } })).places,
    staleTime: 5 * 60 * 1000,
  });
}
