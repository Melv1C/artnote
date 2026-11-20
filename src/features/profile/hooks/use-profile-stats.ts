import {
  fetchMyArtworkCount,
  fetchMyArtworkViewCount,
} from '@/features/artworks/actions/artwork-queries';
import { useQuery } from '@tanstack/react-query';

/** React Query keys for the profile page. */
const profileKeys = {
  stats: ['profile', 'stats'] as const,
};

/** The signed-in admin's published notices and their total views. */
export function useProfileStats({ enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: profileKeys.stats,
    queryFn: async () => {
      const [published, views] = await Promise.all([
        fetchMyArtworkCount({ data: 'PUBLISHED' }),
        fetchMyArtworkViewCount(),
      ]);
      return { published, views };
    },
    enabled,
  });
}
