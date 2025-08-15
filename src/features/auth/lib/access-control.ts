import { auth } from '@/lib/auth';
import { statement } from '@/lib/permissions';
import { type User } from '@/schemas/user';

// =============================================================================
// SERVER-SIDE ACCESS CONTROL
// =============================================================================

type ResourceName = keyof typeof statement;
type ResourceActions<T extends ResourceName> = (typeof statement)[T][number];

export type PermissionCheck = {
  [K in ResourceName]?: ResourceActions<K>[];
};

/**
 * Check if a user has specific permissions (server-side)
 * Use this in server components, API routes, and server actions
 */
export async function checkUserPermission(
  userId: string,
  permissions: PermissionCheck,
): Promise<boolean> {
  try {
    const result = await auth.api.userHasPermission({
      body: {
        userId,
        permissions,
      },
    });
    return result.success;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

/**
 * Check if a role has specific permissions (server-side)
 * Use this in server components, API routes, and server actions
 */
export async function checkRolePermission(
  role: User['role'],
  permissions: PermissionCheck,
): Promise<boolean> {
  try {
    const result = await auth.api.userHasPermission({
      body: {
        role,
        permissions,
      },
    });
    return result.success;
  } catch (error) {
    console.error('Error checking role permission:', error);
    return false;
  }
}

/**
 * Require specific permissions for a user (server-side)
 * Throws an error if the user doesn't have the required permissions
 */
export async function requireUserPermission(
  userId: string,
  permissions: PermissionCheck,
): Promise<void> {
  const hasPermission = await checkUserPermission(userId, permissions);
  if (!hasPermission) {
    throw new Error('Insufficient permissions');
  }
}

/**
 * Require specific permissions for a role (server-side)
 * Throws an error if the role doesn't have the required permissions
 */
export async function requireRolePermission(
  role: User['role'],
  permissions: PermissionCheck,
): Promise<void> {
  const hasPermission = await checkRolePermission(role, permissions);
  if (!hasPermission) {
    throw new Error('Insufficient permissions');
  }
}
