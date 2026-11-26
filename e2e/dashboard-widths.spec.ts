import { expect, notices, places, test } from './fixtures';
import type { Locator, Page } from '@playwright/test';

/** Neither the page nor any of its tables scrolls sideways. */
async function expectNoSidewaysScroll(page: Page) {
  const overflows = await page.evaluate(() =>
    [document.documentElement, ...document.querySelectorAll('[data-slot=table-container]')].map(
      box => box.scrollWidth - box.clientWidth,
    ),
  );
  expect(overflows.every(overflow => overflow <= 0)).toBe(true);
}

const LISTS = [
  { path: '/dashboard/artworks', name: notices.icarus.title, search: 'Rechercher par titre' },
  { path: '/dashboard/artists', name: 'Jan van Eyck', search: 'Rechercher un artiste' },
  { path: '/dashboard/places', name: places.groeninge.name, search: 'Rechercher un lieu' },
  { path: '/dashboard/users', name: 'Lecteur ArtNote', search: 'Rechercher par nom' },
];

/** The element's width in CSS pixels. */
async function widthOf(locator: Locator) {
  return (await locator.boundingBox())?.width ?? 0;
}

// A phone, then a tablet and a small laptop, where the sidebar takes part of the screen
for (const { label, viewport, phone } of [
  { label: 'a phone', viewport: { width: 390, height: 844 }, phone: true },
  { label: 'a tablet', viewport: { width: 768, height: 1024 }, phone: false },
  { label: 'a small laptop', viewport: { width: 1024, height: 768 }, phone: false },
]) {
  test.describe(`an admin on ${label}`, () => {
    test.use({ viewport, isMobile: phone, hasTouch: phone });

    test.beforeEach(async ({ signIn }) => {
      await signIn('admin');
    });

    test('reads the dashboard home without scrolling sideways', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.getByRole('heading', { name: 'Reprendre l’écriture' })).toBeVisible();
      await expectNoSidewaysScroll(page);
    });

    for (const { path, name, search } of LISTS) {
      test(`reaches a row’s actions in ${path} without scrolling sideways`, async ({ page }) => {
        await page.goto(path);
        const menu = page
          .getByRole('row')
          .filter({ hasText: name })
          .getByRole('button', { name: 'Plus d’actions' });
        await expect(menu).toBeVisible();
        // Not pushed past the screen's right edge, where a wide table would put it
        const box = await menu.boundingBox();
        expect((box?.x ?? Infinity) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport.width);
        await expectNoSidewaysScroll(page);
        // Filters beside it never squeeze the search box below a readable width
        expect(await widthOf(page.getByRole('textbox', { name: search }))).toBeGreaterThanOrEqual(
          200,
        );
      });
    }

    if (!phone) {
      test('reads every notice title in full in the list', async ({ page }) => {
        await page.goto('/dashboard/artworks');
        const titles = page.getByRole('table', { name: 'Mes notices' }).getByRole('link', {
          name: notices.lamb.title,
        });
        await expect(titles).toBeVisible();
        const cut = await page
          .getByRole('table', { name: 'Mes notices' })
          .locator('a.work-title')
          .evaluateAll(links => links.filter(link => link.scrollWidth > link.clientWidth).length);
        expect(cut).toBe(0);
      });

      test('writes a notice with the side cards under the text, not squeezing it', async ({
        page,
      }) => {
        await page.goto(`/dashboard/artworks/${notices.icarus.id}/edit`);
        const text = page.getByRole('textbox', { name: 'Notice', exact: true });
        const publication = page.getByRole('heading', { name: 'Publication' });
        await expect(publication).toBeVisible();
        const textBox = await text.boundingBox();
        const publicationBox = await publication.boundingBox();
        expect(publicationBox?.y ?? 0).toBeGreaterThan((textBox?.y ?? 0) + (textBox?.height ?? 0));
      });
    }

    test('tells administrators apart in the accounts list', async ({ page }) => {
      await page.goto('/dashboard/users');
      const admin = page.getByRole('row').filter({ hasText: 'Admin ArtNote' });
      await expect(admin.getByText('Administrateur').filter({ visible: true })).toHaveCount(1);
    });
  });
}
