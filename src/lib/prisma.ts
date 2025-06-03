import { PrismaClient } from '@/generated/prisma';
import { PrismaClient as PrismaClientProd } from '@/generated/prisma/edge';
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

const getPrismaClient = () => {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClientProd().$extends(withAccelerate());
  }

  return new PrismaClient();
}

export const prisma =
  globalForPrisma.prisma ??
  getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
