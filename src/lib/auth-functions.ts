import { checkRolePermission, type PermissionCheck } from '@/features/auth/lib';
import { createIsomorphicFn, createMiddleware, createServerFn } from '@tanstack/react-start';
import { setResponseStatus } from '@tanstack/react-start/server';
import { getUser } from './auth-server';

export const UNAUTHORIZED_ERROR = 'UNAUTHORIZED';

const DASHBOARD_PERMISSIONS: PermissionCheck = { artwork: ['manage'] };

export const getDashboardAccess = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getUser();

  if (!user) {
    return { user: null, canViewDashboard: false };
  }

  return { user, canViewDashboard: await checkRolePermission(user.role, DASHBOARD_PERMISSIONS) };
});

/**
 * Server functions are public HTTP endpoints: every private read and every mutation goes through
 * `requireAuth` or `requirePermission`, which put the signed-in user in `context.user`.
 */
export const requireAuth = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const user = await getUser();

  if (!user) {
    throw new Error(UNAUTHORIZED_ERROR);
  }

  return next({ context: { user } });
});

export const requirePermission = (permissions: PermissionCheck) =>
  createMiddleware({ type: 'function' })
    .middleware([requireAuth])
    .server(async ({ next, context }) => {
      if (!(await checkRolePermission(context.user.role, permissions))) {
        throw new Error(UNAUTHORIZED_ERROR);
      }

      return next();
    });

export const dashboardAccessMiddleware = requirePermission(DASHBOARD_PERMISSIONS);

export const setUnauthorizedStatus = createIsomorphicFn()
  .server(() => setResponseStatus(401))
  .client(() => {});
