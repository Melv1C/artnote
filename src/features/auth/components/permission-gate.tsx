'use client';

import { UserRoleSchema } from '@/schemas';
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { usePermissions, type PermissionCheck } from '../hooks/use-permissions';

// =============================================================================
// PERMISSION-BASED COMPONENTS
// =============================================================================

interface PermissionGateProps {
  /** Children to render if permission check passes */
  children: ReactNode;
  /** Fallback content when permission check fails */
  fallback?: ReactNode;
  /** Required permissions */
  permissions?: PermissionCheck;
  /** Required roles */
  roles?: string | string[];
  /** Whether to show loading state */
  showLoading?: boolean;
  /** Loading content */
  loadingContent?: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 * Use this to protect UI elements that require specific permissions
 */
export function PermissionGate({
  children,
  fallback = null,
  permissions,
  roles,
  showLoading = false,
  loadingContent = null,
}: PermissionGateProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { hasPermission } = usePermissions();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAccess() {
      if (!isAuthenticated) {
        setHasAccess(false);
        return;
      }

      // Check role-based access
      if (roles && user) {
        const roleArray = Array.isArray(roles) ? roles : [roles];
        const hasRole = roleArray.includes(user.role);
        if (!hasRole) {
          setHasAccess(false);
          return;
        }
      }

      // Check permission-based access
      if (permissions) {
        const permissionGranted = await hasPermission(permissions);
        setHasAccess(permissionGranted);
        return;
      }

      // If no specific permissions or roles required, just check authentication
      setHasAccess(isAuthenticated);
    }

    checkAccess();
  }, [isAuthenticated, user, permissions, roles, hasPermission]);

  // Show loading state
  if (isLoading || (showLoading && hasAccess === null)) {
    return loadingContent;
  }

  // Show children if access is granted
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback if access is denied
  return <>{fallback}</>;
}

interface RoleGateProps {
  /** Children to render if role check passes */
  children: ReactNode;
  /** Fallback content when role check fails */
  fallback?: ReactNode;
  /** Required roles */
  roles: string | string[];
  /** Whether to show loading state */
  showLoading?: boolean;
  /** Loading content */
  loadingContent?: ReactNode;
}

/**
 * Component that conditionally renders children based on user roles
 * Simpler than PermissionGate for basic role-based access control
 */
export function RoleGate({
  children,
  fallback = null,
  roles,
  showLoading = false,
  loadingContent = null,
}: RoleGateProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading || (showLoading && !user)) {
    return loadingContent;
  }

  // Check if user has required role
  if (isAuthenticated && user) {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    const hasRole = roleArray.includes(user.role);

    if (hasRole) {
      return <>{children}</>;
    }
  }

  // Show fallback if role check fails
  return <>{fallback}</>;
}

/**
 * Component that renders children only for admin users
 */
export function AdminGate({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGate roles={[UserRoleSchema.enum.admin]} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

/**
 * Component that renders children for content managers (admins)
 */
export function ContentManagerGate({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGate roles={[UserRoleSchema.enum.admin]} fallback={fallback}>
      {children}
    </RoleGate>
  );
}
