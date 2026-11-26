import { expect, places, test } from './fixtures';
import type { Page } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

/** The page fits the phone's width: nothing makes it scroll sideways. */
async function expectNoSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe('an admin on a phone', () => {
  test.beforeEach(async ({ signIn }) => {
    await signIn('admin');
  });

  test('reads the dashboard home without scrolling sideways', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Reprendre l’écriture' })).toBeVisible();
    await expectNoSidewaysScroll(page);
  });

  for (const { path, name } of [
    { path: '/dashboard/artists', name: 'Jan van Eyck' },
    { path: '/dashboard/places', name: places.groeninge.name },
    { path: '/dashboard/users', name: 'Lecteur ArtNote' },
  ]) {
    test(`reaches a row’s actions in ${path} without scrolling sideways`, async ({ page }) => {
      await page.goto(path);
      const menu = page
        .getByRole('row')
        .filter({ hasText: name })
        .getByRole('button', { name: 'Plus d’actions' });
      await expect(menu).toBeVisible();
      // Not pushed past the screen's right edge, where a wide table would put it
      const box = await menu.boundingBox();
      expect((box?.x ?? Infinity) + (box?.width ?? 0)).toBeLessThanOrEqual(
        page.viewportSize()?.width ?? 0,
      );
      await expectNoSidewaysScroll(page);
    });
  }
});
