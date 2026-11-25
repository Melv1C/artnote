import { test as base, expect, type APIResponse, type Page } from '@playwright/test';
import { SEED_PASSWORD, seedUsers } from '../prisma/seed-data';
import { createPrismaClient } from '../src/lib/prisma-client';

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

/** An account a test signed up itself, so it may change it freely. */
interface Credentials {
  email: string;
  password: string;
}

export const test = base.extend<
  {
    /** Post a sign-in to Better Auth and return its response; a success signs the page in. */
    attemptSignIn: (account: Account | Credentials) => Promise<APIResponse>;
    /** Sign in through Better Auth's endpoint; the session cookie lands in the page's context. */
    signIn: (account: Account | Credentials) => Promise<void>;
    /** A reader account signed up for this test alone, with the user role. */
    newReader: Credentials;
  },
  { db: ReturnType<typeof createPrismaClient> }
>({
  attemptSignIn: async ({ page, baseURL }, provide) => {
    await provide(account => {
      const { email, password } =
        typeof account === 'string'
          ? { email: accounts[account], password: SEED_PASSWORD }
          : account;
      return page.request.post('/api/auth/sign-in/email', {
        data: { email, password },
        // Better Auth rejects a cookie-setting request from any origin but BASE_URL
        headers: { origin: baseURL ?? '' },
      });
    });
  },

  signIn: async ({ attemptSignIn }, provide) => {
    await provide(async account => {
      const response = await attemptSignIn(account);
      const name = typeof account === 'string' ? account : account.email;
      expect(response.ok(), `sign-in as ${name}`).toBe(true);
    });
  },

  newReader: async ({ request, baseURL }, provide, testInfo) => {
    const reader = {
      email: `reader-${testInfo.testId}-${Date.now()}@example.com`,
      password: SEED_PASSWORD,
    };
    // Its own request context: signing up does not sign the page in
    const response = await request.post('/api/auth/sign-up/email', {
      data: { ...reader, name: 'Lecteur de test' },
      headers: { origin: baseURL ?? '' },
    });
    expect(response.ok(), `sign-up as ${reader.email}`).toBe(true);
    await provide(reader);
  },

  /** The run's database, the one the web server uses, to restore seed rows a test changed. */
  db: [
    // oxlint-disable-next-line no-empty-pattern -- Playwright reads a fixture's dependencies from it
    async ({}, provide, workerInfo) => {
      const url = workerInfo.config.webServer?.env?.PRISMA_DATABASE_URL;
      if (!url) throw new Error('playwright.config.ts gives the web server no PRISMA_DATABASE_URL');
      const prisma = createPrismaClient(url);
      await provide(prisma);
      await prisma.$disconnect();
    },
    { scope: 'worker' },
  ],
});

/**
 * Open the new notice form and type its title, published or as the default draft. The notice is
 * not saved: the test goes on with the form, then clicks "Créer la notice".
 */
export async function startNotice(page: Page, title: string, { published = false } = {}) {
  await page.goto('/dashboard/artworks/create');
  // Text typed before React hydrates the form is lost
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Titre *', { exact: true }).fill(title);
  if (published) {
    await page.getByRole('combobox', { name: 'Statut', exact: true }).click();
    await page.getByRole('option', { name: 'Publiée', exact: true }).click();
  }
}

export { expect };
