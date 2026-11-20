import { describe, expect, it } from 'vite-plus/test';
import { isAuthorizedCronRequest } from './cron-auth';

const request = (authorization?: string) =>
  new Request('https://artnote.test/api/cron/aggregate-nightly', {
    headers: authorization ? { authorization } : {},
  });

describe('isAuthorizedCronRequest', () => {
  it('accepts the configured bearer token', () => {
    expect(
      isAuthorizedCronRequest(request('Bearer s3cret-token-value'), 's3cret-token-value'),
    ).toBe(true);
  });

  it('rejects a wrong or missing token', () => {
    expect(isAuthorizedCronRequest(request('Bearer nope'), 's3cret-token-value')).toBe(false);
    expect(isAuthorizedCronRequest(request(), 's3cret-token-value')).toBe(false);
  });

  it('fails closed when no secret is configured', () => {
    expect(isAuthorizedCronRequest(request('Bearer undefined'), undefined)).toBe(false);
    expect(isAuthorizedCronRequest(request(), undefined)).toBe(false);
  });
});
