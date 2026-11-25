import type { Prisma } from '@/generated/prisma/client';
import { containsInsensitive as contains } from '@/lib/prisma-filters';
import type { ArtistFiltersSchema } from '@/schemas/artist';
import type { z } from '@/lib/zod';

/** Prisma `where` for the dashboard artist table's search: names and biography. */
export function buildArtistWhere({
  search,
}: z.output<typeof ArtistFiltersSchema>): Prisma.ArtistWhereInput {
  return search
    ? {
        OR: [
          { firstName: contains(search) },
          { lastName: contains(search) },
          { biography: contains(search) },
        ],
      }
    : {};
}
