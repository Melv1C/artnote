import { UserRoleSchema } from '@/schemas';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { env } from './env';
import { ac, admin as adminRole, user, writer } from './permissions';
import { prisma } from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.VERCEL_URL,
  emailAndPassword: {
    enabled: true,
    signUp: {
      enabled: true,
      fields: {
        name: { type: 'text', required: true },
      },
    },
  },
  user: {
    additionalFields: {
      bio: { type: 'string', required: false, input: true },
      cv: { type: 'string', required: false, input: true },
    },
  },
  plugins: [
    admin({
      // Access control configuration
      ac,
      roles: {
        admin: adminRole,
        writer,
        user,
      },
      // Admin configuration
      adminRoles: [UserRoleSchema.Values.admin], // Only 'admin' role has full admin privileges
      defaultRole: UserRoleSchema.Values.user,
      defaultBanReason: "Violation des conditions d'utilisation",
      bannedUserMessage:
        "Votre compte a été suspendu. Veuillez contacter le support si vous pensez qu'il s'agit d'une erreur.",
      impersonationSessionDuration: 60 * 60, // 1 hour
      defaultBanExpiresIn: 60 * 60 * 24 * 7, // 1 week default ban
    }),
  ],
});
