'use client';

import { Artist } from '@/schemas/artist';
import { useQuery } from '@tanstack/react-query';

interface ArtistFilters {
  search?: string;
  name?: string;
  bornAfter?: string;
  bornBefore?: string;
  page?: number;
  limit?: number;
}

interface ArtistsResponse {
  artists: (Artist & {
    createdBy: { id: string; name: string };
    updatedBy: { id: string; name: string };
    artworks: {
      id: string;
      role: string | null;
      artwork: {
        id: string;
        title: string;
        status: string;
      };
    }[];
  })[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

async function fetchArtists(filters: ArtistFilters): Promise<ArtistsResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.name) params.append('name', filters.name);
  if (filters.bornAfter) params.append('bornAfter', filters.bornAfter);
  if (filters.bornBefore) params.append('bornBefore', filters.bornBefore);
  params.append('page', (filters.page || 1).toString());
  params.append('limit', (filters.limit || 50).toString());

  const response = await fetch(`/api/artists?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch artists');
  }

  return response.json();
}

export function useArtists(filters: ArtistFilters = {}) {
  return useQuery({
    queryKey: ['artists', filters],
    queryFn: () => fetchArtists(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useArtist(artistId: string) {
  return useQuery({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      const response = await fetch(`/api/artists/${artistId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch artist');
      }
      return response.json();
    },
    enabled: !!artistId,
  });
}
