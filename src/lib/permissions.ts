import type { UserRole } from '@/schemas/common';
import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

/**
 * Resources and the actions a role can be granted on them. `user` and `session` come from
 * Better Auth's admin plugin (list, ban, set-role, impersonate, …). Reading published content
 * needs no permission: public server functions have no guard.
 */
const statement = {
  ...defaultStatements,
  artwork: ['manage'],
  artist: ['manage'],
  place: ['manage'],
} as const;

export const ac = createAccessControl(statement);

/** Every role and what it grants, for the guards and for Better Auth's admin plugin. */
export const roles = {
  /** Admins write notices, manage artists and places, and administer users. */
  admin: ac.newRole({
    artwork: ['manage'],
    artist: ['manage'],
    place: ['manage'],
    ...adminAc.statements,
  }),
  /** Signed-in readers: nothing beyond what anyone may read. */
  user: ac.newRole({}),
} satisfies Record<UserRole, unknown>;

type Resource = keyof typeof statement;

/** A set of required permissions, e.g. `{ artwork: ['manage'] }`. Every listed action is required. */
export type PermissionCheck = {
  [R in Resource]?: (typeof statement)[R][number][];
};

/** Whether `role` grants every action in `permissions`. Pure: no session or database access. */
export function hasRolePermission(role: UserRole, permissions: PermissionCheck): boolean {
  return roles[role].authorize(permissions).success;
}

/** What the dashboard requires: managing notices. */
export const DASHBOARD_PERMISSIONS = { artwork: ['manage'] } satisfies PermissionCheck;

/** Whether `user` is signed in and may use the dashboard. */
export const canViewDashboard = (user: { role: UserRole } | null) =>
  !!user && hasRolePermission(user.role, DASHBOARD_PERMISSIONS);
