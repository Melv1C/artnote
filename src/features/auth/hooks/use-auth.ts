import { useSession } from '@/lib/auth-client';
import { canViewDashboard } from '@/lib/permissions';
import { parseSessionUser } from '@/schemas/user';
import { useMemo } from 'react';

/** The signed-in user in the browser. UI only: server functions check the session again. */
export function useAuth() {
  const { data: session, isPending, refetch } = useSession();
  const user = useMemo(() => parseSessionUser(session?.user), [session?.user]);

  return {
    user,
    isLoading: isPending,
    /** Writes notices: the dashboard, the profile's bio and statistics */
    canViewDashboard: canViewDashboard(user),
    /** Reload the session, after a change to the user */
    refetch,
  };
}
