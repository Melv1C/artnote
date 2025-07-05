import { z } from 'zod';
import { UserRoleSchema } from './common';

// =============================================================================
// BASE SCHEMA
// =============================================================================

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullish(),
  role: UserRoleSchema,
  bio: z.string().nullish(),
  cv: z.string().nullish(),
  // Admin plugin fields
  banned: z.boolean().nullish(),
  banReason: z.string().nullish(),
  banExpires: z.coerce.date().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  banned: true,
  banReason: true,
  banExpires: true,
});

export const UpdateUserSchema = CreateUserSchema.partial().extend({
  // Allow role updates in admin context
  role: UserRoleSchema.optional(),
});

// Ban/Unban schemas
export const BanUserSchema = z.object({
  userId: z.string(),
  banReason: z.string().optional(),
  banExpiresIn: z.number().optional(), // seconds
});

export const UnbanUserSchema = z.object({
  userId: z.string(),
});

// Role management schemas
export const SetUserRoleSchema = z.object({
  userId: z.string(),
  role: UserRoleSchema,
});

export const CheckPermissionSchema = z.object({
  resource: z.string(),
  action: z.string(),
  userId: z.string().optional(),
});

export const BulkUserActionSchema = z.object({
  userIds: z.array(z.string()),
  action: z.enum(['ban', 'unban', 'delete']),
  banReason: z.string().optional(),
  banExpiresIn: z.number().optional(),
});

// =============================================================================
// FORM SCHEMAS
// =============================================================================

export const UserProfileFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255, 'Le nom est trop long'),
  bio: z.string().optional(),
  cv: z.string().optional(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserProfileForm = z.infer<typeof UserProfileFormSchema>;
export type BanUser = z.infer<typeof BanUserSchema>;
export type UnbanUser = z.infer<typeof UnbanUserSchema>;
export type SetUserRole = z.infer<typeof SetUserRoleSchema>;
export type CheckPermission = z.infer<typeof CheckPermissionSchema>;
export type BulkUserAction = z.infer<typeof BulkUserActionSchema>;
