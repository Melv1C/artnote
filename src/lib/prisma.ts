import '@tanstack/react-start/server-only';
import type { PrismaClient } from '@/generated/prisma/client';
import { env, isProduction } from './env';
import { createPrismaClient } from './prisma-client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient(env.PRISMA_DATABASE_URL);

if (!isProduction) globalForPrisma.prisma = prisma;
