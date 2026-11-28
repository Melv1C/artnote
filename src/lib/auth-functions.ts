import { createIsomorphicFn, createMiddleware, createServerFn } from '@tanstack/react-start';
import { setResponseStatus } from '@tanstack/react-start/server';
import { getUser } from './auth-server';
import {
  DASHBOARD_PERMISSIONS,
  canViewDashboard,
  hasRolePermission,
  type PermissionCheck,
} from './permissions';

export const UNAUTHORIZED_ERROR = 'UNAUTHORIZED';

export const getDashboardAccess = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getUser();
  return { user, canViewDashboard: canViewDashboard(user) };
});

/**
 * Server functions are public HTTP endpoints: every private read and every mutation goes through
 * `requireAuth`, `requirePermission` or `dashboardAccessMiddleware`, which put the signed-in user
 * in `context.user`.
 */
export const requireAuth = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const user = await getUser();
  if (!user) throw new Error(UNAUTHORIZED_ERROR);
  return next({ context: { user } });
});

export const requirePermission = (permissions: PermissionCheck) =>
  createMiddleware({ type: 'function' })
    .middleware([requireAuth])
    .server(({ next, context }) => {
      if (!hasRolePermission(context.user.role, permissions)) throw new Error(UNAUTHORIZED_ERROR);
      return next();
    });

/** Admin-only: everything under `/dashboard` and the data it reads. */
export const dashboardAccessMiddleware = requirePermission(DASHBOARD_PERMISSIONS);

export const setUnauthorizedStatus = createIsomorphicFn()
  .server(() => setResponseStatus(401))
  .client(() => {});
