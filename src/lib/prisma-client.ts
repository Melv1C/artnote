import { Prisma, PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { withAccelerate } from '@prisma/extension-accelerate';

const isAccelerateUrl = (url: string) =>
  url.startsWith('prisma://') || url.startsWith('prisma+postgres://');

export const createPrismaClient = (url: string) => {
  const options: Prisma.PrismaClientOptions = isAccelerateUrl(url)
    ? { accelerateUrl: url }
    : { adapter: new PrismaPg({ connectionString: url }) };
  return new PrismaClient(options).$extends(withAccelerate());
};
