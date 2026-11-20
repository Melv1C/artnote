import type { Prisma } from '@/generated/prisma/client';
import { containsInsensitive as contains } from '@/lib/prisma-filters';
import type { ArtistFiltersSchema } from '@/schemas/artist';
import type { z } from '@/lib/zod';

/** Prisma `where` for the dashboard artist table's filters. */
export function buildArtistWhere(
  filters: z.output<typeof ArtistFiltersSchema>,
): Prisma.ArtistWhereInput {
  const { search, name, bornAfter, bornBefore } = filters;
  return {
    AND: [
      search
        ? {
            OR: [
              { firstName: contains(search) },
              { lastName: contains(search) },
              { biography: contains(search) },
            ],
          }
        : {},
      name ? { OR: [{ firstName: contains(name) }, { lastName: contains(name) }] } : {},
      bornAfter ? { birthDate: { gte: new Date(bornAfter) } } : {},
      bornBefore ? { birthDate: { lte: new Date(bornBefore) } } : {},
    ],
  };
}
