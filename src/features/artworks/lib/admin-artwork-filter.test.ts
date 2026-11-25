import { describe, expect, it } from 'vite-plus/test';
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
const filter = (changes: Partial<typeof DEFAULT_ADMIN_ARTWORK_FILTER>) => ({
  ...DEFAULT_ADMIN_ARTWORK_FILTER,
  ...changes,
});

describe('filterAdminArtworks', () => {
  it('hides archived notices by default, most recently updated first', () => {
    expect(titles(filterAdminArtworks(artworks, DEFAULT_ADMIN_ARTWORK_FILTER))).toEqual([
      'La Mort de Marat',
      "L'Intrigue",
    ]);
  });

  it('shows one status under its tab', () => {
    expect(titles(filterAdminArtworks(artworks, filter({ view: 'ARCHIVED' })))).toEqual([
      'Vieux tableau',
    ]);
  });

  it('searches title, medium and year case-insensitively', () => {
    expect(titles(filterAdminArtworks(artworks, filter({ search: 'HUILE' })))).toEqual([
      "L'Intrigue",
    ]);
  });

  it('filters by creation date, inclusive of the whole end day', () => {
    expect(
      titles(
        filterAdminArtworks(
          artworks,
          filter({ createdAfter: '2026-01-10', createdBefore: '2026-01-10' }),
        ),
      ),
    ).toEqual(['La Mort de Marat', "L'Intrigue"]);
  });

  it('counts the whole start day in the writer’s time zone', () => {
    const justAfterMidnight = { ...artworks[0], createdAt: new Date(2026, 0, 10, 0, 30) };
    expect(
      filterAdminArtworks([justAfterMidnight], filter({ createdAfter: '2026-01-10' })),
    ).toHaveLength(1);
  });

  it('sorts by any column in either direction', () => {
    expect(titles(filterAdminArtworks(artworks, filter({ sortBy: 'viewCount' })))[0]).toBe(
      'La Mort de Marat',
    );
    expect(
      titles(filterAdminArtworks(artworks, filter({ sortBy: 'title', sortOrder: 'asc' }))),
    ).toEqual(["L'Intrigue", 'La Mort de Marat']);
  });
});

describe('countActiveFilters', () => {
  it('counts the sort and dates that differ from the defaults, not the tab or the search', () => {
    expect(countActiveFilters(filter({ view: 'ARCHIVED', search: 'x' }))).toBe(0);
    expect(countActiveFilters(filter({ sortBy: 'title', createdAfter: '2026-01-01' }))).toBe(2);
  });
});
