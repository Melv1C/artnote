import { z } from 'zod';
import { IdSchema, UserRoleSchema } from './common';

/** A user as Better Auth returns it. Private: never send it from a public server function. */
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
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

/** The public face of a user, e.g. a notice's writer. Safe for public server functions. */
export const AuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
});

/** Prisma `select` that matches `AuthorSchema`. */
export const authorSelect = { id: true, name: true, image: true } as const;

export const UserProfileFormSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(255, 'Le nom est trop long'),
  bio: z.string().max(20_000).optional(),
  cv: z
    .union([
      z.literal(''),
      z.url({ protocol: /^https$/, message: 'Le lien doit être une URL https' }),
    ])
    .optional(),
});

export const UserIdSchema = z.object({ userId: IdSchema });

export const SetUserRoleSchema = UserIdSchema.extend({ role: UserRoleSchema });

export const BanUserSchema = UserIdSchema.extend({
  banReason: z.string().max(500).optional(),
  banExpiresIn: z.number().int().positive().optional(), // seconds
});

export type User = z.infer<typeof UserSchema>;
export type UserProfileForm = z.infer<typeof UserProfileFormSchema>;
