import { PrismaClient } from '@/generated/prisma/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { env, NodeEnv } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

const getPrismaClient = () => {
  return new PrismaClient().$extends(withAccelerate());
};

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (env.NODE_ENV !== NodeEnv.PRODUCTION) globalForPrisma.prisma = prisma;
