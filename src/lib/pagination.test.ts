import { describe, expect, it } from 'vite-plus/test';
import { pageWindow, paginate } from './pagination';

describe('pagination', () => {
  it('describes a middle page and a last page', () => {
    expect(paginate(2, 50, 120)).toEqual({
      page: 2,
      limit: 50,
      totalCount: 120,
      totalPages: 3,
      hasMore: true,
    });
    expect(paginate(3, 50, 120).hasMore).toBe(false);
    expect(paginate(1, 50, 0)).toMatchObject({ totalPages: 0, hasMore: false });
  });

  it('skips the previous pages', () => {
    expect(pageWindow(1, 50)).toEqual({ skip: 0, take: 50 });
    expect(pageWindow(3, 50)).toEqual({ skip: 100, take: 50 });
  });
});
