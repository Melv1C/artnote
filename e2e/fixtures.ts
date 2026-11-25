import { test as base, expect } from '@playwright/test';
import { SEED_PASSWORD, seedUsers } from '../prisma/seed-data';

// The seed, in the run's own database. Every seed notice is written by admin; `empire` is a draft.
export {
  SEED_PASSWORD as PASSWORD,
  seedNotices as notices,
  seedPlaces as places,
} from '../prisma/seed-data';

export const accounts = {
  admin: seedUsers.admin.email,
  writer: seedUsers.writer.email,
  user: seedUsers.user.email,
  banned: seedUsers.banned.email,
};

type Account = keyof typeof accounts;

export const test = base.extend<{ signIn: (account: Account) => Promise<void> }>({
  /** Sign in through Better Auth's endpoint; the session cookie lands in the page's context. */
  signIn: async ({ page, baseURL }, provide) => {
    await provide(async account => {
      const response = await page.request.post('/api/auth/sign-in/email', {
        data: { email: accounts[account], password: SEED_PASSWORD },
        // Better Auth rejects a cookie-setting request from any origin but BASE_URL
        headers: { origin: baseURL ?? '' },
      });
      expect(response.ok(), `sign-in as ${account}`).toBe(true);
    });
  },
});

export { expect };
