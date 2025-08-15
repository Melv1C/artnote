import { PrismaClient } from '@/generated/prisma/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { env, isProduction } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

const getPrismaClient = () => {
  return new PrismaClient({
    datasourceUrl: env.PRISMA_DATABASE_URL,
  }).$extends(withAccelerate());
};

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (!isProduction) globalForPrisma.prisma = prisma;
