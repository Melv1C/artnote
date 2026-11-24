import type { Prisma } from '@/generated/prisma/client';
import { containsInsensitive as contains } from '@/lib/prisma-filters';
import type { z } from '@/lib/zod';
import type { PlaceFiltersSchema } from '@/schemas/place';

/** Prisma `where` for the dashboard place table's filters. */
export function buildPlaceWhere(
  filters: z.output<typeof PlaceFiltersSchema>,
): Prisma.PlaceWhereInput {
  const { search, type, city, country, missingPosition } = filters;
  return {
    ...(search && {
      OR: [{ name: contains(search) }, { address: contains(search) }, { city: contains(search) }],
    }),
    ...(type && { type }),
    ...(city && { city: contains(city) }),
    ...(country && { country: contains(country) }),
    // In AND, so it never replaces the search's OR
    ...(missingPosition && { AND: [{ OR: [{ latitude: null }, { longitude: null }] }] }),
  };
}
