import { describe, expect, it } from 'vite-plus/test';
import { nextPublishedAt } from './artwork-status';

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
