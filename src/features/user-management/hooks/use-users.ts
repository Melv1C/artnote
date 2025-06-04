'use client';

import { User, UserSchema } from '@/schemas/user';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { z } from 'zod';

interface GetUsersParams {
  search?: string;
  role?: 'ADMIN' | 'WRITER' | 'VIEWER' | 'all';
  emailVerified?: boolean | 'all';
  page?: number;
  limit?: number;
}

// Response validation schema
const GetUsersResponseSchema = z.object({
  users: z.array(UserSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    totalCount: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
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
  const url = '/api/admin/users?limit=100'; // Fetch all users with a high limit

  try {
    const response = await axios.get(url);

    // Validate the response data
    const validatedResponse = GetUsersResponseSchema.parse(response.data);

    return validatedResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch users: ${error.response?.statusText || error.message}`
      );
    }
    if (error instanceof z.ZodError) {
      console.error('Invalid response data:', error.errors);
      throw new Error('Invalid response data from server');
    }
    throw error;
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
