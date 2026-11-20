import { describe, expect, it } from 'vitest';
import { clientIpFrom } from './view-count';

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
