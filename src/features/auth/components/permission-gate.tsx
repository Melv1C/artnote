import { hasRolePermission, type PermissionCheck } from '@/lib/permissions';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/use-auth';

interface PermissionGateProps {
  permissions: PermissionCheck;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Render `children` only when the signed-in user's role grants `permissions`.
 * UI only: the server functions behind the UI enforce the same check.
 */
export function PermissionGate({ permissions, children, fallback = null }: PermissionGateProps) {
  const { user } = useAuth();
  return user && hasRolePermission(user.role, permissions) ? children : fallback;
}
