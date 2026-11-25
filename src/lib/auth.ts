import '@tanstack/react-start/server-only';
import { UserRoleSchema } from '@/schemas/common';
import { MIN_PASSWORD_LENGTH } from '@/schemas/user';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { env } from './env';
import { ac, roles } from './permissions';
import { prisma } from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BASE_URL,
  // Rate limiting keys on the client IP: read it from the header the reverse proxy sets
  ...(env.CLIENT_IP_HEADER && {
    advanced: { ipAddress: { ipAddressHeaders: [env.CLIENT_IP_HEADER] } },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    signUp: {
      enabled: true,
      fields: {
        name: { type: 'text', required: true },
      },
    },
  },
  user: {
    additionalFields: {
      // Set only through `updateProfile`, which validates them; not through Better Auth's endpoints
      bio: { type: 'string', required: false, input: false },
      cv: { type: 'string', required: false, input: false },
    },
  },
  plugins: [
    admin({
      ac,
      roles,
      adminRoles: [UserRoleSchema.enum.admin],
      defaultRole: UserRoleSchema.enum.user,
      defaultBanReason: "Violation des conditions d'utilisation",
      bannedUserMessage:
        "Votre compte a été suspendu. Veuillez contacter le support si vous pensez qu'il s'agit d'une erreur.",
      impersonationSessionDuration: 60 * 60,
      defaultBanExpiresIn: 60 * 60 * 24 * 7,
    }),
    // Must stay last so auth cookies are set through TanStack Start's cookie helpers
    tanstackStartCookies(),
  ],
});
