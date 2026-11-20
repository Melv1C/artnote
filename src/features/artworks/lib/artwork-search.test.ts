import { describe, expect, it } from 'vite-plus/test';
import {
  ArtworkFiltersSchema,
  ArtworksSearchSchema,
  buildArtworkOrderBy,
  buildArtworkWhere,
  sortByFirstArtist,
  toArtworkFilters,
} from './artwork-search';

const filters = (input: Parameters<typeof ArtworkFiltersSchema.parse>[0]) =>
  ArtworkFiltersSchema.parse(input);

describe('public notice search', () => {
  it('keeps numeric URL params and turns them into string filters', () => {
    const search = ArtworksSearchSchema.parse({ year: 1890, sort: 'year', order: 'sideways' });
    expect(search).toEqual({ year: 1890, sort: 'year', order: undefined });
    expect(toArtworkFilters(search)).toMatchObject({ year: '1890', sort: 'year' });
  });

  it('drops an over-long URL value instead of failing the page', () => {
    expect(ArtworksSearchSchema.parse({ search: 'x'.repeat(201) }).search).toBeUndefined();
  });

  it('only ever matches published notices', () => {
    const where = buildArtworkWhere(filters({ search: 'Ensor', year: '1888' }));
    expect(where).toMatchObject({ status: 'PUBLISHED', publishedAt: { not: null } });
  });

  it('rejects oversized search text', () => {
    expect(ArtworkFiltersSchema.safeParse({ search: 'x'.repeat(201) }).success).toBe(false);
  });

  it('orders by title by default and breaks ties by title', () => {
    expect(buildArtworkOrderBy(filters({}))).toEqual([{ title: 'asc' }]);
    expect(buildArtworkOrderBy(filters({ sort: 'year', order: 'desc' }))).toEqual([
      { creationYear: 'desc' },
      { title: 'asc' },
    ]);
  });

  it('sorts by first artist with French collation', () => {
    const artwork = (firstName: string, lastName: string) => ({
      artists: [{ artist: { firstName, lastName } }],
    });
    const sorted = sortByFirstArtist(
      [artwork('Rik', 'Wouters'), artwork('Émile', 'Claus'), artwork('James', 'Ensor')],
      'asc',
    );
    expect(sorted.map(a => a.artists[0]?.artist.lastName)).toEqual(['Claus', 'Ensor', 'Wouters']);
  });
});
