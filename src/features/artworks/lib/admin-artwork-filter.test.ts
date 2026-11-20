import { describe, expect, it } from 'vitest';
import {
  countActiveFilters,
  DEFAULT_ADMIN_ARTWORK_FILTER,
  filterAdminArtworks,
} from './admin-artwork-filter';

const artwork = (
  title: string,
  overrides: Partial<Parameters<typeof filterAdminArtworks>[0][0]> = {},
) => ({
  title,
  medium: null,
  creationYear: null,
  status: 'DRAFT' as const,
  createdAt: new Date('2026-01-10T10:00:00'),
  updatedAt: new Date('2026-01-10T10:00:00'),
  viewCount: 0,
  ...overrides,
});

const artworks = [
  artwork('La Mort de Marat', {
    status: 'PUBLISHED',
    updatedAt: new Date('2026-03-01'),
    viewCount: 9,
  }),
  artwork("L'Intrigue", { medium: 'Huile sur toile', updatedAt: new Date('2026-02-01') }),
  artwork('Vieux tableau', { status: 'ARCHIVED', createdAt: new Date('2025-05-05') }),
];

const titles = (list: { title: string }[]) => list.map(a => a.title);

describe('filterAdminArtworks', () => {
  it('hides archived notices by default, most recently updated first', () => {
    expect(titles(filterAdminArtworks(artworks, DEFAULT_ADMIN_ARTWORK_FILTER))).toEqual([
      'La Mort de Marat',
      "L'Intrigue",
    ]);
  });

  it('searches title, medium and year case-insensitively', () => {
    expect(titles(filterAdminArtworks(artworks, { search: 'HUILE' }))).toEqual(["L'Intrigue"]);
  });

  it('filters by creation date, inclusive of the whole end day', () => {
    expect(
      titles(
        filterAdminArtworks(artworks, { createdAfter: '2026-01-10', createdBefore: '2026-01-10' }),
      ),
    ).toEqual(['La Mort de Marat', "L'Intrigue"]);
  });

  it('sorts by any column in either direction', () => {
    expect(
      titles(filterAdminArtworks(artworks, { sortBy: 'viewCount', sortOrder: 'desc' }))[0],
    ).toBe('La Mort de Marat');
    expect(titles(filterAdminArtworks(artworks, { sortBy: 'title', sortOrder: 'asc' }))).toEqual([
      "L'Intrigue",
      'La Mort de Marat',
      'Vieux tableau',
    ]);
  });
});

describe('countActiveFilters', () => {
  it('ignores defaults and search', () => {
    expect(countActiveFilters({ ...DEFAULT_ADMIN_ARTWORK_FILTER, search: 'x' })).toBe(0);
    expect(
      countActiveFilters({ status: ['ARCHIVED'], sortBy: 'title', createdAfter: '2026-01-01' }),
    ).toBe(3);
  });
});
