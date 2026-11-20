import { ArtistFiltersSchema } from '@/schemas/artist';
import { describe, expect, it } from 'vite-plus/test';
import { buildArtistWhere } from './artist-filters';

const where = (input: Parameters<typeof ArtistFiltersSchema.parse>[0]) =>
  buildArtistWhere(ArtistFiltersSchema.parse(input));

describe('buildArtistWhere', () => {
  it('matches nothing in particular without filters', () => {
    expect(where({})).toEqual({ AND: [{}, {}, {}, {}] });
  });

  it('searches names and biography, and names alone with the name filter', () => {
    const [search, name] = where({ search: 'Ensor', name: 'James' }).AND as object[];
    expect(JSON.stringify(search)).toContain('biography');
    expect(JSON.stringify(name)).not.toContain('biography');
  });

  it('bounds the birth date on both sides', () => {
    expect(where({ bornAfter: '1800-01-01', bornBefore: '1900-01-01' }).AND).toEqual([
      {},
      {},
      { birthDate: { gte: new Date('1800-01-01') } },
      { birthDate: { lte: new Date('1900-01-01') } },
    ]);
  });
});
