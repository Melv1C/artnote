import { fetchArtists } from '@/features/artists/actions/artist-queries';
import { fetchPlaces } from '@/features/places/actions/place-queries';
import { useQuery } from '@tanstack/react-query';

const SELECTOR_LIMIT = 100;

export function useArtists(search?: string) {
  return useQuery({
    queryKey: ['artists', search],
    queryFn: async () => (await fetchArtists({ data: { search, limit: SELECTOR_LIMIT } })).artists,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlaces(search?: string) {
  return useQuery({
    queryKey: ['places', search],
    queryFn: async () => (await fetchPlaces({ data: { search, limit: SELECTOR_LIMIT } })).places,
    staleTime: 5 * 60 * 1000,
  });
}
