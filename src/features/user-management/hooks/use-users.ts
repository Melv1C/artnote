'use client';

import { authClient } from '@/lib/auth-client';
import { User, UserSchema } from '@/schemas/user';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// Response validation schema for Better Auth admin plugin
const BetterAuthUsersResponseSchema = z.object({
  users: z.array(UserSchema),
  total: z.number(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

interface GetUsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// TODO: When we have more users (>100), implement server-side filtering,
// pagination, and search to improve performance. For now, we fetch all users
// and filter client-side for better UX.
async function fetchAllUsers(): Promise<GetUsersResponse> {
  try {
    // Use Better Auth admin plugin to list users
    const response = await authClient.admin.listUsers({
      query: {
        limit: 100, // Fetch all users with a high limit
        offset: 0,
      },
    });

    console.log('Fetched users:', response.data);

    // Validate the response data
    const validatedResponse = BetterAuthUsersResponseSchema.parse(response.data);

    console.log('Validated users response:', validatedResponse);

    // Convert to our expected format
    const limit = validatedResponse.limit || 100;
    const totalCount = validatedResponse.total;
    const totalPages = Math.ceil(totalCount / limit);
    const page = 1; // Since we're fetching all on page 1
    const hasMore = false; // We're getting all users

    return {
      users: validatedResponse.users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
      },
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error(
      `Failed to fetch users: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'], // Simple key since we fetch all users
    queryFn: fetchAllUsers,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for getting users with client-side filtering
// Note: Filtering is now handled in the component for better real-time UX
export function useUsersWithSearch() {
  return useUsers(); // Just return all users, filtering happens client-side
}
