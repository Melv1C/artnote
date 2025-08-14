'use client';

import { Artist } from '@/schemas/artist';
import { Place } from '@/schemas/place';
import { useQuery } from '@tanstack/react-query';

// Fetch artists hook
export function useArtists(search?: string) {
  return useQuery({
    queryKey: ['artists', search],
    queryFn: async (): Promise<Artist[]> => {
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }
      params.append('limit', '100'); // Get more for selection

      const response = await fetch(`/api/artists?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch artists');
      }
      const data = await response.json();
      return data.artists || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch places hook
export function usePlaces(search?: string) {
  return useQuery({
    queryKey: ['places', search],
    queryFn: async (): Promise<Place[]> => {
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }
      params.append('limit', '100'); // Get more for selection

      const response = await fetch(`/api/places?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch places');
      }
      const data = await response.json();
      return data.places || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
