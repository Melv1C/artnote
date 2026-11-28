import type { Prisma } from '@/generated/prisma/client';
import { PlaceFiltersSchema, type Place } from '@/schemas/place';
import { describe, expect, it } from 'vite-plus/test';
import { buildPlaceWhere } from './place-filters';

type Row = Pick<Place, 'id' | 'name' | 'type' | 'address' | 'city' | 'country'>;

/**
 * Whether Postgres would return `row` for `where`, for the conditions the place filters use:
 * equality, `in` and `AND`. Throws on any other condition.
 */
function matches(row: Row, where: Prisma.PlaceWhereInput): boolean {
  return Object.entries(where).every(([key, condition]: [string, unknown]) => {
    if (key === 'AND') {
      return ([condition].flat() as Prisma.PlaceWhereInput[]).every(each => matches(row, each));
    }
    const value = row[key as keyof Row];
    if (condition === null || typeof condition !== 'object') return value === condition;
    if ('in' in condition && Array.isArray(condition.in)) return condition.in.includes(value);
    throw new Error(`Unsupported condition on ${key}: ${JSON.stringify(condition)}`);
  });
}

// Each place's id is its name, so the text filters' ids read as names
const place = (row: Partial<Row> & Pick<Row, 'name' | 'type'>): Row => ({
  id: row.name,
  address: null,
  city: null,
  country: 'Belgique',
  ...row,
});

const places = [
  place({ name: 'MSK Gent', type: 'MUSEUM', address: 'Fernand Scribedreef 1', city: 'Gand' }),
  place({ name: 'Cathédrale Saint-Bavon', type: 'CHURCH', city: 'Gand' }),
  place({ name: 'Église Saint-Michel', type: 'CHURCH', city: 'Gand' }),
  place({ name: 'Musée Groeninge', type: 'MUSEUM', address: 'Dijver 12', city: 'Bruges' }),
  place({ name: 'Rijksmuseum', type: 'MUSEUM', city: 'Amsterdam', country: 'Pays-Bas' }),
];

const found = (
  input: Parameters<typeof PlaceFiltersSchema.parse>[0],
  textIds: (string[] | undefined)[] = [],
) => {
  const where = buildPlaceWhere(PlaceFiltersSchema.parse(input), textIds);
  return places.filter(row => matches(row, where)).map(row => row.name);
};

describe('buildPlaceWhere', () => {
  it('keeps every place without filters', () => {
    expect(found({}, [undefined, undefined])).toHaveLength(places.length);
  });

  it('keeps the places every text filter matches, of the exact type', () => {
    const search = ['MSK Gent', 'Cathédrale Saint-Bavon', 'Rijksmuseum'];
    const city = ['MSK Gent', 'Cathédrale Saint-Bavon', 'Église Saint-Michel'];
    expect(found({ type: 'MUSEUM' }, [search, city])).toEqual(['MSK Gent']);
    expect(found({}, [search, undefined, city])).toEqual(['MSK Gent', 'Cathédrale Saint-Bavon']);
  });
});
