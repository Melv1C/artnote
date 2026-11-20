import { describe, expect, it } from 'vitest';
import { nextPublishedAt, ownedBy, publishedWhere } from './artwork-status';

const now = new Date('2026-11-20T12:00:00Z');
const firstPublished = new Date('2025-01-01T00:00:00Z');

describe('nextPublishedAt', () => {
  it('stamps a first publication with now', () => {
    expect(nextPublishedAt('PUBLISHED', null, now)).toBe(now);
  });

  it('keeps the first publication date when a published notice is saved again', () => {
    expect(nextPublishedAt('PUBLISHED', firstPublished, now)).toBe(firstPublished);
  });

  it('clears the date when a notice leaves publication', () => {
    expect(nextPublishedAt('DRAFT', firstPublished, now)).toBeNull();
    expect(nextPublishedAt('ARCHIVED', firstPublished, now)).toBeNull();
  });
});

describe('ownedBy', () => {
  it("scopes dashboard queries to the writer's own notices", () => {
    expect(ownedBy('u1')).toEqual({ writerId: 'u1' });
    expect(ownedBy('u1', 'a1')).toEqual({ writerId: 'u1', id: 'a1' });
  });
});

describe('publishedWhere', () => {
  it('requires the status and a publication date', () => {
    expect(publishedWhere).toEqual({ status: 'PUBLISHED', publishedAt: { not: null } });
  });
});
