import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
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
      role: { type: 'string', required: true, defaultValue: 'USER', input: false },
      bio: { type: 'string', required: false, input: true },
      cv: { type: 'string', required: false, input: true },
    },
  },
});
