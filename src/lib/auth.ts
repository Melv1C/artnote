import { UserRoleSchema } from '@/schemas';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { env } from './env';
import { prisma } from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
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
      role: {
        type: 'string',
        required: true,
        defaultValue: UserRoleSchema.Values.VIEWER,
        input: false,
      },
      bio: { type: 'string', required: false, input: true },
      cv: { type: 'string', required: false, input: true },
    },
  },
});
