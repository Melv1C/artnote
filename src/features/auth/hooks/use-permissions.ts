'use client';

import { authClient } from '@/lib/auth-client';
import { statement } from '@/lib/permissions';
import { type User } from '@/schemas/user';
import { useCallback } from 'react';
import { useAuth } from './use-auth';

// =============================================================================
// CLIENT-SIDE ACCESS CONTROL HOOKS
// =============================================================================

type ResourceName = keyof typeof statement;
type ResourceActions<T extends ResourceName> = (typeof statement)[T][number];

export type PermissionCheck = {
  [K in ResourceName]?: ResourceActions<K>[];
};

export interface UsePermissionsReturn {
  /** Check if current user has specific permissions */
  hasPermission: (permissions: PermissionCheck) => Promise<boolean>;
  /** Check if a role has specific permissions (synchronous) */
  checkRolePermission: (role: User['role'], permissions: PermissionCheck) => boolean;
  /** Check if current user can manage artworks */
  canManageArtworks: () => Promise<boolean>;
  /** Check if current user can manage artists */
  canManageArtists: () => Promise<boolean>;
  /** Check if current user can manage places */
  canManagePlaces: () => Promise<boolean>;
  /** Check if current user can manage concepts */
  canManageConcepts: () => Promise<boolean>;
  /** Check if current user can manage keywords */
  canManageKeywords: () => Promise<boolean>;
  /** Check if current user can manage users */
  canManageUsers: () => Promise<boolean>;
}

/**
 * Hook for checking permissions on the client side
 * Use this in client components for permission checks
 */
export function usePermissions(): UsePermissionsReturn {
  const { isAuthenticated } = useAuth();

  const hasPermission = useCallback(
    async (permissions: PermissionCheck): Promise<boolean> => {
      if (!isAuthenticated) return false;

      try {
        const result = await authClient.admin.hasPermission({
          permissions,
        });
        return result.data?.success ?? false;
      } catch (error) {
        console.error('Error checking permission:', error);
        return false;
      }
    },
    [isAuthenticated],
  );

  const checkRolePermission = useCallback(
    (role: User['role'], permissions: PermissionCheck): boolean => {
      try {
        return authClient.admin.checkRolePermission({
          permissions,
          role,
        });
      } catch (error) {
        console.error('Error checking role permission:', error);
        return false;
      }
    },
    [],
  );

  // Convenient permission checkers for common operations
  const canManageArtworks = useCallback(
    () => hasPermission({ artwork: ['manage'] }),
    [hasPermission],
  );
  const canManageArtists = useCallback(
    () => hasPermission({ artist: ['manage'] }),
    [hasPermission],
  );
  const canManagePlaces = useCallback(() => hasPermission({ place: ['manage'] }), [hasPermission]);
  const canManageConcepts = useCallback(
    () => hasPermission({ concept: ['manage'] }),
    [hasPermission],
  );
  const canManageKeywords = useCallback(
    () => hasPermission({ keyword: ['manage'] }),
    [hasPermission],
  );
  const canManageUsers = useCallback(
    () => hasPermission({ user: ['list', 'ban', 'set-role'] }),
    [hasPermission],
  );

  return {
    hasPermission,
    checkRolePermission,
    canManageArtworks,
    canManageArtists,
    canManagePlaces,
    canManageConcepts,
    canManageKeywords,
    canManageUsers,
  };
}
