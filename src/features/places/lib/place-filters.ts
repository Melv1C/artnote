import type { Prisma } from '@/generated/prisma/client';
import type { z } from '@/lib/zod';
import type { PlaceFiltersSchema } from '@/schemas/place';

/**
 * Prisma `where` for the dashboard place table's filters. The text filters (search, city, country)
 * come as `textIds`: for each one given, the ids of the places it matches (`idsContaining`).
 */
export function buildPlaceWhere(
  { type, missingPosition }: z.output<typeof PlaceFiltersSchema>,
  textIds: (string[] | undefined)[],
): Prisma.PlaceWhereInput {
  return {
    ...(type && { type }),
    AND: [
      ...textIds.flatMap(ids => (ids ? [{ id: { in: ids } }] : [])),
      ...(missingPosition ? [{ OR: [{ latitude: null }, { longitude: null }] }] : []),
    ],
  };
}
