import { useQuery } from '@tanstack/react-query';
import { fetchArtist, fetchArtists } from '../actions/artist-queries';

const TABLE_PAGE_SIZE = 50;

type ArtistFilters = Parameters<typeof fetchArtists>[0]['data'];

export function useArtists(filters: ArtistFilters = {}) {
  return useQuery({
    queryKey: ['artists', filters],
    queryFn: () => fetchArtists({ data: { limit: TABLE_PAGE_SIZE, ...filters } }),
    staleTime: 30 * 1000,
  });
}

export function useArtist(artistId: string) {
  return useQuery({
    queryKey: ['artist', artistId],
    queryFn: () => fetchArtist({ data: artistId }),
    enabled: !!artistId,
  });
}
