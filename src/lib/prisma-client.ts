import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export const createPrismaClient = (url: string) =>
  new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
