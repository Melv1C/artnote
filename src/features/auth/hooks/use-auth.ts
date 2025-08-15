'use client';

import { useSession } from '@/lib/auth-client';
import { UserRoleSchema } from '@/schemas';
import { UserSchema, type User } from '@/schemas/user';
import { useMemo } from 'react';

export interface UseAuthReturn {
  /** The authenticated user, parsed and validated with the user schema */
  user: User | null;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether the session is still loading */
  isLoading: boolean;
  /** Session error if any */
  error: Error | null;
  /** Check if user has a specific role */
  hasRole: (role: User['role'] | User['role'][]) => boolean;
  /** Check if user is admin (ADMIN) */
  isAdmin: boolean;
  /** Check if user is writer */
  isWriter: boolean;
  /** Refetch the session */
  refetch: () => void;
}

/**
 * Custom hook for authentication that provides:
 * - Type-safe user data parsed with Zod schema
 * - Convenient role checking utilities
 * - Loading and error states
 */
export function useAuth(): UseAuthReturn {
  const { data: session, isPending, error, refetch } = useSession();

  // Parse and validate user data with schema
  const user = useMemo(() => {
    if (!session?.user) return null;

    try {
      // Parse the user data with our schema to ensure type safety
      return UserSchema.parse(session.user);
    } catch (parseError) {
      console.warn('Failed to parse user data:', parseError);
      return null;
    }
  }, [session?.user]);

  // Role checking utilities
  const hasRole = (role: User['role'] | User['role'][]) => {
    if (!user) return false;
    return Array.isArray(role) ? role.includes(user.role) : user.role === role;
  };

  const isAdmin = hasRole(UserRoleSchema.enum.admin);
  const isWriter = hasRole(UserRoleSchema.enum.writer);

  return {
    user,
    isAuthenticated: !!user,
    isLoading: isPending,
    error,
    hasRole,
    isAdmin,
    isWriter,
    refetch,
  };
}
