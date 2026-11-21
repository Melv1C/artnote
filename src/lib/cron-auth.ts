import { createHash, timingSafeEqual } from 'node:crypto';

const digest = (value: string) => createHash('sha256').update(value).digest();

/**
 * True when the request carries `Authorization: Bearer <secret>`, as the scheduled job sends it.
 * Fails closed: with no secret configured, every request is rejected.
 */
export function isAuthorizedCronRequest(request: Request, secret: string | undefined): boolean {
  if (!secret) return false;
  const header = request.headers.get('authorization') ?? '';
  // Hash both sides so the comparison is constant-time whatever the header length
  return timingSafeEqual(digest(header), digest(`Bearer ${secret}`));
}
