import { test as base, expect } from '@playwright/test';

// The seeded accounts (prisma/seed.ts) and notices, in the run's own database
export const PASSWORD = 'artnote-dev-password';

export const accounts = {
  admin: 'admin@example.com',
  writer: 'writer@example.com',
  user: 'user@example.com',
  banned: 'banned@example.com',
} as const;

type Account = keyof typeof accounts;

export const notices = {
  /** Published, written by admin */
  icarus: { id: 'seed-artwork-icarus', title: 'Paysage avec la chute d’Icare' },
  /** Draft, written by admin */
  empire: { id: 'seed-artwork-empire', title: 'L’Empire des lumières' },
} as const;

export const test = base.extend<{ signIn: (account: Account) => Promise<void> }>({
  /** Sign in through Better Auth's endpoint; the session cookie lands in the page's context. */
  signIn: async ({ page, baseURL }, provide) => {
    await provide(async account => {
      const response = await page.request.post('/api/auth/sign-in/email', {
        data: { email: accounts[account], password: PASSWORD },
        // Better Auth rejects a cookie-setting request from any origin but BASE_URL
        headers: { origin: baseURL ?? '' },
      });
      expect(response.ok(), `sign-in as ${account}`).toBe(true);
    });
  },
});

export { expect };
