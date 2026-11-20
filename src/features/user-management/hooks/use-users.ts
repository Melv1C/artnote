import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../actions/user-queries';

/** React Query keys for user reads. Invalidate `userKeys.all` after any user mutation. */
export const userKeys = {
  all: ['users'] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => fetchUsers(),
    staleTime: 30 * 1000,
  });
}
