import { describe, expect, it } from 'vite-plus/test';
import { clientIpFrom, VIEW_DEDUPLICATION_WINDOW_MS, viewRecordsExpireBefore } from './view-count';

describe('clientIpFrom', () => {
  it('takes the first address of the header', () => {
    expect(clientIpFrom('203.0.113.7, 10.0.0.1')).toBe('203.0.113.7');
    expect(clientIpFrom(' 2001:db8::1 ')).toBe('2001:db8::1');
  });

  it('returns null without a usable header', () => {
    expect(clientIpFrom(undefined)).toBeNull();
    expect(clientIpFrom('')).toBeNull();
    expect(clientIpFrom(' , ')).toBeNull();
  });
});

describe('viewRecordsExpireBefore', () => {
  it('never prunes a record still inside the deduplication window', () => {
    const now = new Date('2026-11-20T12:00:00Z');
    const cutoff = viewRecordsExpireBefore(now);
    expect(now.getTime() - cutoff.getTime()).toBeGreaterThanOrEqual(VIEW_DEDUPLICATION_WINDOW_MS);
    expect(cutoff.toISOString()).toBe('2026-11-19T12:00:00.000Z');
  });
});
