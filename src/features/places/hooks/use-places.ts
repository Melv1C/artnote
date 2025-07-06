'use client';

import { Place } from '@/schemas/place';
import { useQuery } from '@tanstack/react-query';

interface PlaceFilters {
  search?: string;
  type?: string;
  city?: string;
  country?: string;
  page?: number;
  limit?: number;
}

interface PlacesResponse {
  places: (Place & {
    createdBy: { id: string; name: string };
    updatedBy: { id: string; name: string };
    artworks: { id: string; title: string }[];
  })[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

async function fetchPlaces(filters: PlaceFilters): Promise<PlacesResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.type) params.append('type', filters.type);
  if (filters.city) params.append('city', filters.city);
  if (filters.country) params.append('country', filters.country);
  params.append('page', (filters.page || 1).toString());
  params.append('limit', (filters.limit || 50).toString());

  const response = await fetch(`/api/places?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch places');
  }

  return response.json();
}

export function usePlaces(filters: PlaceFilters = {}) {
  return useQuery({
    queryKey: ['places', filters],
    queryFn: () => fetchPlaces(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function usePlace(placeId: string) {
  return useQuery({
    queryKey: ['place', placeId],
    queryFn: async () => {
      const response = await fetch(`/api/places/${placeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch place');
      }
      return response.json();
    },
    enabled: !!placeId,
  });
}
