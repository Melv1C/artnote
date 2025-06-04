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
  image: z.string().nullable(),
  role: UserRoleSchema,
  bio: z.string().nullable(),
  cv: z.string().nullable(),
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
});

export const UpdateUserSchema = CreateUserSchema.partial();

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
