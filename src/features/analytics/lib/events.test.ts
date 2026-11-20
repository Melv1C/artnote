import { describe, expect, it } from 'vitest';
import { AnalyticsEventPayloadSchema, categorizePagePath, referrerDomain } from './events';

describe('categorizePagePath', () => {
  it.each([
    ['/', 'home'],
    ['/artworks/abc123', 'notice'],
    ['/artworks/abc123/preview', 'notice'],
    ['/artworks', 'other'],
    ['/about', 'about'],
    ['/dashboard', 'dashboard'],
    ['/dashboard/artworks', 'dashboard'],
    ['/dashboards', 'other'],
    ['/whats-new', 'other'],
  ])('%s is %s', (path, category) => {
    expect(categorizePagePath(path)).toBe(category);
  });
});

describe('referrerDomain', () => {
  it('keeps only the hostname', () => {
    expect(referrerDomain('https://www.google.com/search?q=artnote')).toBe('www.google.com');
    expect(referrerDomain('not a url')).toBeNull();
    expect(referrerDomain('')).toBeNull();
  });
});

describe('AnalyticsEventPayloadSchema', () => {
  it('rejects unknown event types', () => {
    expect(AnalyticsEventPayloadSchema.safeParse({ eventType: 'purchase' }).success).toBe(false);
  });

  it('truncates long strings, clamps durations and drops bad optional values', () => {
    const event = AnalyticsEventPayloadSchema.parse({
      eventType: 'page_view_end',
      path: `/${'a'.repeat(500)}`,
      pageCategory: 'checkout',
      durationMs: 10 * 24 * 60 * 60 * 1000,
      timestamp: 'yesterday',
      meta: { blob: 'x'.repeat(2000) },
    });
    expect(event.path).toHaveLength(200);
    expect(event.pageCategory).toBeNull();
    expect(event.durationMs).toBe(24 * 60 * 60 * 1000);
    expect(event.timestamp).toBeInstanceOf(Date);
    expect(event.meta).toBeNull();
  });

  it('drops fields it does not know', () => {
    const event = AnalyticsEventPayloadSchema.parse({
      eventType: 'cookie_accept',
      ipAddress: '1.2.3.4',
    });
    expect(event).not.toHaveProperty('ipAddress');
  });
});
