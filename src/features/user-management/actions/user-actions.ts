import { createServerFn } from '@tanstack/react-start';
import { authClient } from '@/lib/auth-client';
import { getRequiredUser } from '@/lib/auth-server';
import { UserRole, UserRoleSchema } from '@/schemas';
import { BanUser, UnbanUser } from '@/schemas/user';
import { z } from 'zod';

// =============================================================================
// ACTION SCHEMAS
// =============================================================================

const UpdateUserRoleSchema = z.object({
  userId: z.string(),
  role: UserRoleSchema,
});

const DeleteUserSchema = z.object({
  userId: z.string(),
});

// =============================================================================
// SERVER ACTIONS
// =============================================================================

/**
 * Update a user's role using Better Auth admin plugin
 * Only admins can perform this action
 */
export const updateUserRole = createServerFn({ method: 'POST' })
  .validator((data: { userId: string; role: UserRole }) => data)
  .handler(async ({ data: { userId, role } }) => {
    try {
      // Validate user is authenticated and is admin
      const currentUser = await getRequiredUser();
      if (currentUser.role !== UserRoleSchema.enum.admin) {
        throw new Error('Unauthorized: Only admins can update user roles');
      }

      // Validate input data
      const validatedData = UpdateUserRoleSchema.parse({ userId, role });

      // Prevent admin from changing their own role
      if (currentUser.id === validatedData.userId) {
        throw new Error('Cannot change your own role');
      }

      // Use Better Auth admin plugin to update user role
      await authClient.admin.setRole({
        userId: validatedData.userId,
        role: validatedData.role,
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  });

/**
 * Delete a user using Better Auth admin plugin
 * Only admins can perform this action
 */
export const deleteUser = createServerFn({ method: 'POST' })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    try {
      // Validate user is authenticated and is admin
      const currentUser = await getRequiredUser();
      if (currentUser.role !== UserRoleSchema.enum.admin) {
        throw new Error('Unauthorized: Only admins can delete users');
      }

      // Validate input data
      const validatedData = DeleteUserSchema.parse({ userId });

      // Prevent admin from deleting themselves
      if (currentUser.id === validatedData.userId) {
        throw new Error('Cannot delete your own account');
      }

      // Use Better Auth admin plugin to remove user
      await authClient.admin.removeUser({
        userId: validatedData.userId,
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  });

/**
 * Ban a user using Better Auth admin plugin
 * Only admins can perform this action
 */
export const banUser = createServerFn({ method: 'POST' })
  .validator((data: BanUser) => data)
  .handler(async ({ data: { userId, banReason, banExpiresIn } }) => {
    try {
      // Validate user is authenticated and is admin
      const currentUser = await getRequiredUser();
      if (currentUser.role !== UserRoleSchema.enum.admin) {
        throw new Error('Unauthorized: Only admins can ban users');
      }

      // Prevent admin from banning themselves
      if (currentUser.id === userId) {
        throw new Error('Cannot ban your own account');
      }

      // Use Better Auth admin plugin to ban user
      await authClient.admin.banUser({
        userId,
        banReason,
        banExpiresIn,
      });

      return { success: true };
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  });

/**
 * Unban a user using Better Auth admin plugin
 * Only admins can perform this action
 */
export const unbanUser = createServerFn({ method: 'POST' })
  .validator((data: UnbanUser) => data)
  .handler(async ({ data: { userId } }) => {
    try {
      // Validate user is authenticated and is admin
      const currentUser = await getRequiredUser();
      if (currentUser.role !== UserRoleSchema.enum.admin) {
        throw new Error('Unauthorized: Only admins can unban users');
      }

      // Use Better Auth admin plugin to unban user
      await authClient.admin.unbanUser({
        userId,
      });

      return { success: true };
    } catch (error) {
      console.error('Error unbanning user:', error);
      throw error;
    }
  });

/**
 * Create a new user using Better Auth admin plugin
 * Only admins can perform this action
 */
export const createUser = createServerFn({ method: 'POST' })
  .validator(
    (userData: { name: string; email: string; password: string; role?: UserRole }) => userData,
  )
  .handler(async ({ data: userData }) => {
    try {
      // Validate user is authenticated and is admin
      const currentUser = await getRequiredUser();
      if (currentUser.role !== UserRoleSchema.enum.admin) {
        throw new Error('Unauthorized: Only admins can create users');
      }

      // Use Better Auth admin plugin to create user
      const newUser = await authClient.admin.createUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || UserRoleSchema.enum.user,
      });

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  });

/**
 * Impersonate a user using Better Auth admin plugin
 * Only admins can perform this action
 */
export const impersonateUser = createServerFn({ method: 'POST' })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    try {
      // Validate user is authenticated and is admin
      const currentUser = await getRequiredUser();
      if (currentUser.role !== UserRoleSchema.enum.admin) {
        throw new Error('Unauthorized: Only admins can impersonate users');
      }

      // Prevent admin from impersonating themselves
      if (currentUser.id === userId) {
        throw new Error('Cannot impersonate your own account');
      }

      // Use Better Auth admin plugin to impersonate user
      await authClient.admin.impersonateUser({
        userId,
      });

      return { success: true };
    } catch (error) {
      console.error('Error impersonating user:', error);
      throw error;
    }
  });

/**
 * Stop impersonating a user using Better Auth admin plugin
 */
export const stopImpersonating = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    // Use Better Auth admin plugin to stop impersonating
    await authClient.admin.stopImpersonating();

    return { success: true };
  } catch (error) {
    console.error('Error stopping impersonation:', error);
    throw error;
  }
});
