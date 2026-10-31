import { dashboardAccessMiddleware } from '@/lib/auth-functions';
import { prisma } from '@/lib/prisma';
import { UserRoleSchema } from '@/schemas';
import { createServerFn } from '@tanstack/react-start';

export const fetchTotalUserCount = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(() => prisma.user.count());

export const fetchAdminUserCount = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(() =>
    prisma.user.count({
      where: {
        role: UserRoleSchema.enum.admin,
      },
    }),
  );

export const fetchNewUsersThisWeek = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(async () => {
    // Calculate date ranges
    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    // Get new users this week
    const newUsersThisWeek = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfThisWeek,
        },
      },
    });

    // Get new users last week for comparison
    const newUsersLastWeek = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfLastWeek,
          lt: startOfThisWeek,
        },
      },
    });

    return { newUsersThisWeek, newUsersLastWeek };
  });

/**
 * Start every user stat query without awaiting, so each card streams in independently.
 */
export const loadUserStats = () => ({
  totalUsers: fetchTotalUserCount(),
  adminCount: fetchAdminUserCount(),
  newUsers: fetchNewUsersThisWeek(),
});

export type UserStatsData = ReturnType<typeof loadUserStats>;
