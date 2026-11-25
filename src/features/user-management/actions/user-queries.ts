import { auth } from '@/lib/auth';
import { dashboardAccessMiddleware, requirePermission } from '@/lib/auth-functions';
import { prisma } from '@/lib/prisma';
import { UserRoleSchema } from '@/schemas/common';
import { UserSchema } from '@/schemas/user';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

const USER_LIST_LIMIT = 100;

export const fetchUsers = createServerFn({ method: 'GET' })
  .middleware([requirePermission({ user: ['list'] })])
  .handler(async () => {
    const result = await auth.api.listUsers({
      query: { limit: USER_LIST_LIMIT, offset: 0 },
      headers: getRequestHeaders(),
    });
    return { users: UserSchema.array().parse(result.users), total: result.total };
  });

/**
 * Accounts, admins among them, and sign-ups since the start of this week (Sunday, server time) and
 * during the week before.
 */
export const fetchUserStats = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(async () => {
    const startOfThisWeek = new Date();
    startOfThisWeek.setDate(startOfThisWeek.getDate() - startOfThisWeek.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const [total, admins, newThisWeek, newLastWeek] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRoleSchema.enum.admin } }),
      prisma.user.count({ where: { createdAt: { gte: startOfThisWeek } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfLastWeek, lt: startOfThisWeek } } }),
    ]);
    return { total, admins, newThisWeek, newLastWeek };
  });
