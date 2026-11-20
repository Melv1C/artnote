import type { UserRole } from '@/schemas/common';
import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

/**
 * Resources and the actions a role can be granted on them. `user` and `session` come from
 * Better Auth's admin plugin (list, ban, set-role, impersonate, …).
 */
export const statement = {
  ...defaultStatements,
  artwork: ['read', 'manage'],
  artist: ['read', 'manage'],
  place: ['read', 'manage'],
} as const;

export const ac = createAccessControl(statement);

/** Admins write notices, manage artists and places, and administer users. */
export const admin = ac.newRole({
  artwork: ['read', 'manage'],
  artist: ['read', 'manage'],
  place: ['read', 'manage'],
  ...adminAc.statements,
});

/** Signed-in readers: published content only. */
export const user = ac.newRole({
  artwork: ['read'],
  artist: ['read'],
  place: ['read'],
});

export const roles = { admin, user } satisfies Record<UserRole, unknown>;

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
