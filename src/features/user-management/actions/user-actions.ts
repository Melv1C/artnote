import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';
import { requireAuth, requirePermission } from '@/lib/auth-functions';
import { UserRole, UserRoleSchema, UserSchema } from '@/schemas';
import { BanUser, UnbanUser } from '@/schemas/user';
import { z } from 'zod';

const USER_LIST_LIMIT = 100;

function assertNotSelf(currentUserId: string, targetUserId: string, message: string) {
  if (currentUserId === targetUserId) {
    throw new Error(message);
  }
}

export const fetchUsers = createServerFn({ method: 'GET' })
  .middleware([requirePermission({ user: ['list'] })])
  .handler(async () => {
    const result = await auth.api.listUsers({
      query: { limit: USER_LIST_LIMIT, offset: 0 },
      headers: getRequestHeaders(),
    });

    return { users: z.array(UserSchema).parse(result.users), total: result.total };
  });

export const updateUserRole = createServerFn({ method: 'POST' })
  .middleware([requirePermission({ user: ['set-role'] })])
  .validator((data: { userId: string; role: UserRole }) =>
    z.object({ userId: z.string(), role: UserRoleSchema }).parse(data),
  )
  .handler(async ({ data: { userId, role }, context: { user } }) => {
    assertNotSelf(user.id, userId, 'Cannot change your own role');
    await auth.api.setRole({ body: { userId, role }, headers: getRequestHeaders() });
    return { success: true };
  });

export const deleteUser = createServerFn({ method: 'POST' })
  .middleware([requirePermission({ user: ['delete'] })])
  .validator((userId: string) => z.string().parse(userId))
  .handler(async ({ data: userId, context: { user } }) => {
    assertNotSelf(user.id, userId, 'Cannot delete your own account');
    await auth.api.removeUser({ body: { userId }, headers: getRequestHeaders() });
    return { success: true };
  });

export const banUser = createServerFn({ method: 'POST' })
  .middleware([requirePermission({ user: ['ban'] })])
  .validator((data: BanUser) => data)
  .handler(async ({ data: { userId, banReason, banExpiresIn }, context: { user } }) => {
    assertNotSelf(user.id, userId, 'Cannot ban your own account');
    await auth.api.banUser({
      body: { userId, banReason, banExpiresIn },
      headers: getRequestHeaders(),
    });
    return { success: true };
  });

export const unbanUser = createServerFn({ method: 'POST' })
  .middleware([requirePermission({ user: ['ban'] })])
  .validator((data: UnbanUser) => data)
  .handler(async ({ data: { userId } }) => {
    await auth.api.unbanUser({ body: { userId }, headers: getRequestHeaders() });
    return { success: true };
  });

export const createUser = createServerFn({ method: 'POST' })
  .middleware([requirePermission({ user: ['create'] })])
  .validator(
    (userData: { name: string; email: string; password: string; role?: UserRole }) => userData,
  )
  .handler(async ({ data: userData }) => {
    const newUser = await auth.api.createUser({
      body: {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || UserRoleSchema.enum.user,
      },
      headers: getRequestHeaders(),
    });
    return { success: true, user: newUser };
  });

export const impersonateUser = createServerFn({ method: 'POST' })
  .middleware([requirePermission({ user: ['impersonate'] })])
  .validator((userId: string) => z.string().parse(userId))
  .handler(async ({ data: userId, context: { user } }) => {
    assertNotSelf(user.id, userId, 'Cannot impersonate your own account');
    await auth.api.impersonateUser({ body: { userId }, headers: getRequestHeaders() });
    return { success: true };
  });

export const stopImpersonating = createServerFn({ method: 'POST' })
  .middleware([requireAuth])
  .handler(async () => {
    await auth.api.stopImpersonating({ headers: getRequestHeaders() });
    return { success: true };
  });
