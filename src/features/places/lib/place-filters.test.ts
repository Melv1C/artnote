import type { Prisma } from '@/generated/prisma/client';
import { PlaceFiltersSchema, type Place } from '@/schemas/place';
import { describe, expect, it } from 'vite-plus/test';
import { buildPlaceWhere } from './place-filters';

type Row = Pick<Place, 'name' | 'type' | 'address' | 'city' | 'country' | 'latitude' | 'longitude'>;

/**
 * Whether Postgres would return `row` for `where`, for the conditions the place filters use:
 * equality, `null`, `contains` ignoring case, `AND` and `OR`. Throws on any other condition.
 */
function matches(row: Row, where: Prisma.PlaceWhereInput): boolean {
  return Object.entries(where).every(([key, condition]: [string, unknown]) => {
    if (key === 'AND' || key === 'OR') {
      const conditions = [condition].flat() as Prisma.PlaceWhereInput[];
      const met = (each: Prisma.PlaceWhereInput) => matches(row, each);
      return key === 'AND' ? conditions.every(met) : conditions.some(met);
    }
    const value = row[key as keyof Row];
    if (condition === null || typeof condition !== 'object') return value === condition;
    if ('contains' in condition && typeof condition.contains === 'string') {
      return (
        typeof value === 'string' && value.toLowerCase().includes(condition.contains.toLowerCase())
      );
    }
    throw new Error(`Unsupported condition on ${key}: ${JSON.stringify(condition)}`);
  });
}

const place = (row: Partial<Row> & Pick<Row, 'name' | 'type'>): Row => ({
  address: null,
  city: null,
  country: 'Belgique',
  latitude: 51,
  longitude: 4,
  ...row,
});

const places = [
  place({ name: 'MSK Gent', type: 'MUSEUM', address: 'Fernand Scribedreef 1', city: 'Gand' }),
  place({ name: 'Cathédrale Saint-Bavon', type: 'CHURCH', city: 'Gand' }),
  place({ name: 'Église Saint-Michel', type: 'CHURCH', city: 'Gand', longitude: null }),
  place({ name: 'Notre-Dame', type: 'CHURCH', city: 'Bruges', latitude: null, longitude: null }),
  place({
    name: 'Musée Groeninge',
    type: 'MUSEUM',
    address: 'Dijver 12',
    city: 'Bruges',
    latitude: null,
    longitude: null,
  }),
  place({ name: 'Rijksmuseum', type: 'MUSEUM', city: 'Amsterdam', country: 'Pays-Bas' }),
];

const found = (input: Parameters<typeof PlaceFiltersSchema.parse>[0]) => {
  const where = buildPlaceWhere(PlaceFiltersSchema.parse(input));
  return places.filter(row => matches(row, where)).map(row => row.name);
};

describe('buildPlaceWhere', () => {
  it('keeps every place without filters', () => {
    expect(found({})).toHaveLength(places.length);
  });

  it('filters by exact type and by partial city and country, ignoring case', () => {
    expect(found({ type: 'MUSEUM', city: 'gand', country: 'belg' })).toEqual(['MSK Gent']);
  });

  it('searches name, address and city, ignoring case', () => {
    expect(found({ search: 'msk' })).toEqual(['MSK Gent']);
    expect(found({ search: 'dijver' })).toEqual(['Musée Groeninge']);
    expect(found({ search: 'AMSTERDAM' })).toEqual(['Rijksmuseum']);
  });

  it('keeps only places missing a latitude or a longitude', () => {
    expect(found({ missingPosition: true })).toEqual([
      'Église Saint-Michel',
      'Notre-Dame',
      'Musée Groeninge',
    ]);
    expect(found({ missingPosition: false })).toHaveLength(places.length);
  });

  it('applies the missing position and the search together, neither replacing the other', () => {
    expect(found({ missingPosition: true, search: 'gand', type: 'CHURCH' })).toEqual([
      'Église Saint-Michel',
    ]);
  });
});
