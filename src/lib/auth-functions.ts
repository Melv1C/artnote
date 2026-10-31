import { checkRolePermission } from '@/features/auth/lib';
import { createIsomorphicFn, createMiddleware, createServerFn } from '@tanstack/react-start';
import { setResponseStatus } from '@tanstack/react-start/server';
import { getUser } from './auth-server';

export const UNAUTHORIZED_ERROR = 'UNAUTHORIZED';

const canViewDashboard = (role: Parameters<typeof checkRolePermission>[0]) =>
  checkRolePermission(role, { artwork: ['read'] });

/**
 * Resolve the current user and whether they may access the dashboard.
 */
export const getDashboardAccess = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getUser();

  if (!user) {
    return { user: null, canViewDashboard: false };
  }

  return { user, canViewDashboard: await canViewDashboard(user.role) };
});

/**
 * Guards dashboard server functions, which are callable on their own (unlike server components).
 */
export const dashboardAccessMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const user = await getUser();

    if (!user || !(await canViewDashboard(user.role))) {
      throw new Error(UNAUTHORIZED_ERROR);
    }

    return next({ context: { user } });
  },
);

/**
 * Mark the SSR response as 401, matching Next's `unauthorized()`. No-op on the client.
 */
export const setUnauthorizedStatus = createIsomorphicFn()
  .server(() => setResponseStatus(401))
  .client(() => {});
