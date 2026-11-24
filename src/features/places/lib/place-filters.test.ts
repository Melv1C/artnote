import { PlaceFiltersSchema } from '@/schemas/place';
import { describe, expect, it } from 'vite-plus/test';
import { buildPlaceWhere } from './place-filters';

const where = (input: Parameters<typeof PlaceFiltersSchema.parse>[0]) =>
  buildPlaceWhere(PlaceFiltersSchema.parse(input));

describe('buildPlaceWhere', () => {
  it('has no conditions without filters', () => {
    expect(where({})).toEqual({});
  });

  it('filters by exact type and by partial city and country, ignoring case', () => {
    expect(where({ type: 'MUSEUM', city: 'gand', country: 'belg' })).toEqual({
      type: 'MUSEUM',
      city: { contains: 'gand', mode: 'insensitive' },
      country: { contains: 'belg', mode: 'insensitive' },
    });
  });

  it('searches name, address and city', () => {
    expect(where({ search: 'MSK' }).OR).toHaveLength(3);
  });

  it('keeps only places missing a latitude or a longitude', () => {
    expect(where({ missingPosition: true })).toEqual({
      AND: [{ OR: [{ latitude: null }, { longitude: null }] }],
    });
    expect(where({ missingPosition: false })).toEqual({});
  });

  it('combines the missing position with search and type', () => {
    const combined = where({ missingPosition: true, search: 'gand', type: 'CHURCH' });
    expect(combined.type).toBe('CHURCH');
    expect(combined.OR).toHaveLength(3);
    expect(combined.AND).toEqual([{ OR: [{ latitude: null }, { longitude: null }] }]);
  });
});
