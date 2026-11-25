import { z } from '@/lib/zod';
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

/**
 * The signed-in user of a Better Auth session, on the server or in the browser, or null. A user
 * whose row does not fit the schema (e.g. an unknown role) is treated as signed out.
 */
export function parseSessionUser(sessionUser: unknown): User | null {
  if (!sessionUser) return null;
  const user = UserSchema.safeParse(sessionUser);
  if (!user.success) console.error('Session user does not match UserSchema:', user.error.issues);
  return user.data ?? null;
}

/** The public face of a user, e.g. a notice's writer. Safe for public server functions. */
export const AuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
});

/** Prisma `select` that matches `AuthorSchema`. */
export const authorSelect = { id: true, name: true, image: true } as const;

/** A CV link: https only, so it can be rendered as a link (no `javascript:` hrefs). */
export const CvLinkSchema = z.url({
  protocol: /^https$/,
  message: 'Le lien doit être une URL https',
});

export const UserProfileFormSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(255, 'Le nom est trop long'),
  bio: z.string().max(20_000).optional(),
  cv: z.union([z.literal(''), CvLinkSchema]).optional(),
});

export const SignInSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const SignUpSchema = z
  .object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.email(),
    // Better Auth's minimum password length (`minPasswordLength`, 8 by default)
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export const UserIdSchema = z.object({ userId: IdSchema });

export const SetUserRoleSchema = UserIdSchema.extend({ role: UserRoleSchema });

export const BanUserSchema = UserIdSchema.extend({
  banReason: z.string().max(500).optional(),
  banExpiresIn: z.number().int().positive().optional(), // seconds
});

export type User = z.infer<typeof UserSchema>;
export type UserProfileForm = z.infer<typeof UserProfileFormSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
