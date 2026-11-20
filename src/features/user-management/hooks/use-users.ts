import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../actions/user-actions';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
