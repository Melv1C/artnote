import { prisma } from '@/lib/prisma';
import { UserSchema } from '@/schemas/user';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Query parameters schema for filtering and pagination
const GetUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: UserSchema.shape.role.optional(),
  emailVerified: z.enum(['true', 'false']).optional(),
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1))
    .optional()
    .default('1'),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional()
    .default('10'),
});

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

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const { search, role, emailVerified, page, limit } =
      GetUsersQuerySchema.parse(queryParams);

    // Build where clause for filtering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (emailVerified !== undefined) {
      where.emailVerified = emailVerified === 'true';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get users with count for pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          role: true,
          bio: true,
          cv: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Validate the response data
    const validatedUsers = users.map((user) => UserSchema.parse(user)); // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    // Prepare response data
    const responseData = {
      users: validatedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
      },
    };

    // Validate response data before sending
    const validatedResponse = GetUsersResponseSchema.parse(responseData);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('Error fetching users:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
