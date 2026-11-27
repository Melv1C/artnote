import { describe, expect, it } from 'vite-plus/test';
import {
  ArtworkFiltersSchema,
  ArtworksSearchSchema,
  buildArtworkOrderBy,
  buildArtworkWhere,
  sortByFirstArtist,
  toArtworkFilters,
} from './artwork-search';
import { publishedWhere } from './artwork-status';

const filters = (input: Parameters<typeof ArtworkFiltersSchema.parse>[0]) =>
  ArtworkFiltersSchema.parse(input);

describe('public notice search', () => {
  it('keeps numeric URL params and turns them into string filters', () => {
    const search = ArtworksSearchSchema.parse({ search: 1890, sort: 'year', order: 'sideways' });
    expect(search).toEqual({ search: 1890, sort: 'year', order: undefined });
    expect(toArtworkFilters(search)).toMatchObject({ search: '1890', sort: 'year' });
  });

  it('drops an over-long URL value instead of failing the page', () => {
    expect(ArtworksSearchSchema.parse({ search: 'x'.repeat(201) }).search).toBeUndefined();
  });

  it('only ever matches published notices', () => {
    const where = buildArtworkWhere(filters({ search: 'Ensor', place: 'Musée Magritte' }), {
      artworks: ['a'],
    });
    expect(where).toMatchObject({ status: 'PUBLISHED', publishedAt: { not: null } });
  });

  it('matches a notice the search finds in itself, one of its artists or its place', () => {
    const where = buildArtworkWhere(filters({ search: 'Beaux-Arts' }), {
      artworks: ['notice'],
      artists: ['artist'],
      places: ['place'],
    });
    expect(where.AND).toContainEqual({
      OR: [
        { id: { in: ['notice'] } },
        { artists: { some: { artistId: { in: ['artist'] } } } },
        { placeId: { in: ['place'] } },
      ],
    });
  });

  it('keeps every published notice without a search', () => {
    expect(buildArtworkWhere(filters({}), {})).toEqual({ ...publishedWhere, AND: [{}, {}] });
  });

  it('narrows to one place by its whole name, not every place whose name contains it', () => {
    const where = buildArtworkWhere(filters({ place: 'Musée Magritte' }), {});
    expect(where.AND).toContainEqual({
      place: { name: { equals: 'Musée Magritte', mode: 'insensitive' } },
    });
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
