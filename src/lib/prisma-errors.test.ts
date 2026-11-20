import { Prisma } from '@/generated/prisma/client';
import { isNotFound } from '@tanstack/react-router';
import { describe, expect, it } from 'vite-plus/test';
import { orNotFound } from './prisma-errors';

const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('failed', { code, clientVersion: 'test' });

describe('orNotFound', () => {
  it('passes the result through', async () => {
    await expect(orNotFound(Promise.resolve(42))).resolves.toBe(42);
  });

  it('reports a missing record as not found', async () => {
    const error: unknown = await orNotFound(Promise.reject(prismaError('P2025'))).catch(e => e);
    expect(isNotFound(error)).toBe(true);
  });

  it('rethrows any other error', async () => {
    await expect(orNotFound(Promise.reject(prismaError('P2002')))).rejects.toBeInstanceOf(
      Prisma.PrismaClientKnownRequestError,
    );
  });
});
