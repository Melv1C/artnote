import { Prisma } from '@/generated/prisma/client';
import { notFound } from '@tanstack/react-router';

/** Run a Prisma write on one record and report a missing record as `notFound()`. */
export async function orNotFound<T>(write: Promise<T>): Promise<T> {
  try {
    return await write;
  } catch (error) {
    // P2025: the record to update or delete does not exist
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw notFound();
    }
    throw error;
  }
}
