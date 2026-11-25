import { fetchMyArtworkStats } from '@/features/artworks/actions/artwork-queries';
import { useQuery } from '@tanstack/react-query';

/** The signed-in admin's notice figures: published notices and their total views. */
export function useProfileStats({ enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: ['profile', 'stats'],
    queryFn: () => fetchMyArtworkStats(),
    enabled,
  });
}
