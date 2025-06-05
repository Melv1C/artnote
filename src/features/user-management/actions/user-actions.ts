'use server';

import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { UserRole, UserRoleSchema, UserSchema } from '@/schemas';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// =============================================================================
// ACTION SCHEMAS
// =============================================================================

const UpdateUserRoleSchema = z.object({
  userId: UserSchema.shape.id,
  role: UserRoleSchema,
});

const DeleteUserSchema = z.object({
  userId: UserSchema.shape.id,
});

// =============================================================================
// SERVER ACTIONS
// =============================================================================

/**
 * Update a user's role
 * Only admins can perform this action
 */
export async function updateUserRole(userId: string, role: UserRole) {
  try {
    // Validate user is authenticated and is admin
    const currentUser = await getRequiredUser();
    if (currentUser.role !== UserRoleSchema.Values.ADMIN) {
      throw new Error('Unauthorized: Only admins can update user roles');
    }

    // Validate input data
    const validatedData = UpdateUserRoleSchema.parse({ userId, role });

    // Prevent admin from changing their own role
    if (currentUser.id === validatedData.userId) {
      throw new Error('Cannot change your own role');
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!targetUser) {
      throw new Error('User not found');
    }

    // Update user role
    await prisma.user.update({
      where: { id: validatedData.userId },
      data: { role: validatedData.role },
    });

    // Revalidate the users page to update the UI
    revalidatePath('/admin/users');

    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Delete a user
 * Only admins can perform this action
 */
export async function deleteUser(userId: string) {
  try {
    // Validate user is authenticated and is admin
    const currentUser = await getRequiredUser();
    if (currentUser.role !== UserRoleSchema.Values.ADMIN) {
      throw new Error('Unauthorized: Only admins can delete users');
    }

    // Validate input data
    const validatedData = DeleteUserSchema.parse({ userId });

    // Prevent admin from deleting themselves
    if (currentUser.id === validatedData.userId) {
      throw new Error('Cannot delete your own account');
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!targetUser) {
      throw new Error('User not found');
    }

    // Delete user (this will cascade delete related records based on schema)
    await prisma.user.delete({
      where: { id: validatedData.userId },
    });

    // Revalidate the users page to update the UI
    revalidatePath('/admin/users');

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
