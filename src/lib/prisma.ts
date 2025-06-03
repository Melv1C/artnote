import { PrismaClient } from '@/generated/prisma/edge';
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

const getPrismaClient = () => {
  const client = new PrismaClient();

  if (process.env.NODE_ENV === 'production') {
    return client.$extends(withAccelerate());
  }

  return client;
}

export const prisma =
  globalForPrisma.prisma ??
  getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
