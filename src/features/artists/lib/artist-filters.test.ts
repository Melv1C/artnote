import { ArtistFiltersSchema } from '@/schemas/artist';
import { describe, expect, it } from 'vite-plus/test';
import { buildArtistWhere } from './artist-filters';

const where = (input: Parameters<typeof ArtistFiltersSchema.parse>[0]) =>
  buildArtistWhere(ArtistFiltersSchema.parse(input));

describe('buildArtistWhere', () => {
  it('matches nothing in particular without filters', () => {
    expect(where({})).toEqual({ AND: [{}, {}] });
  });

  it('searches names and biography, and names alone with the name filter', () => {
    const [search, name] = where({ search: 'Ensor', name: 'James' }).AND as object[];
    expect(JSON.stringify(search)).toContain('biography');
    expect(JSON.stringify(name)).not.toContain('biography');
  });
});
