import { useQuery } from '@tanstack/react-query';
import { fetchPlace, fetchPlaces } from '../actions/place-queries';

const TABLE_PAGE_SIZE = 50;

type PlaceFilters = Parameters<typeof fetchPlaces>[0]['data'];

export function usePlaces(filters: PlaceFilters = {}) {
  return useQuery({
    queryKey: ['places', filters],
    queryFn: () => fetchPlaces({ data: { limit: TABLE_PAGE_SIZE, ...filters } }),
    staleTime: 30 * 1000,
  });
}

export function usePlace(placeId: string) {
  return useQuery({
    queryKey: ['place', placeId],
    queryFn: () => fetchPlace({ data: placeId }),
    enabled: !!placeId,
  });
}
