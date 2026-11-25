import { auth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth-functions';
import { IdSchema } from '@/schemas/common';
import { BanUserSchema, SetUserRoleSchema, UserIdSchema } from '@/schemas/user';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

// Admins act on other accounts only: these would lock them out of their own
function assertNotSelf(currentUserId: string, targetUserId: string) {
  if (currentUserId === targetUserId) {
    throw new Error('Action impossible sur votre propre compte');
  }
}

export const updateUserRole = createServerFn({ method: 'POST' })
  .middleware([requirePermission({ user: ['set-role'] })])
  .validator(SetUserRoleSchema)
  .handler(async ({ data: { userId, role }, context: { user } }) => {
    assertNotSelf(user.id, userId);
    await auth.api.setRole({ body: { userId, role }, headers: getRequestHeaders() });
  });

export const deleteUser = createServerFn({ method: 'POST' })
  .middleware([requirePermission({ user: ['delete'] })])
  .validator(IdSchema)
  .handler(async ({ data: userId, context: { user } }) => {
    assertNotSelf(user.id, userId);
    await auth.api.removeUser({ body: { userId }, headers: getRequestHeaders() });
  });

export const banUser = createServerFn({ method: 'POST' })
  .middleware([requirePermission({ user: ['ban'] })])
  .validator(BanUserSchema)
  .handler(async ({ data: { userId, banReason }, context: { user } }) => {
    assertNotSelf(user.id, userId);
    await auth.api.banUser({
      body: { userId, banReason },
      headers: getRequestHeaders(),
    });
  });

export const unbanUser = createServerFn({ method: 'POST' })
  .middleware([requirePermission({ user: ['ban'] })])
  .validator(UserIdSchema)
  .handler(async ({ data: { userId } }) => {
    await auth.api.unbanUser({ body: { userId }, headers: getRequestHeaders() });
  });

export const impersonateUser = createServerFn({ method: 'POST' })
  .middleware([requirePermission({ user: ['impersonate'] })])
  .validator(IdSchema)
  .handler(async ({ data: userId, context: { user } }) => {
    assertNotSelf(user.id, userId);
    await auth.api.impersonateUser({ body: { userId }, headers: getRequestHeaders() });
  });
