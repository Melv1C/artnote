import { expect, test } from './fixtures';

test.describe('the theme button', () => {
  test('switches between light and dark on each click, and keeps the choice', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Each button names the theme it switches to
    const toDark = page.getByRole('button', { name: 'Passer au thème sombre' });
    const toLight = page.getByRole('button', { name: 'Passer au thème clair' });
    await expect(toDark).toBeVisible();

    // One click switches theme: there is no menu and no "like the device" choice
    await toDark.click();
    await expect(toLight).toBeVisible();
    await expect(page.getByRole('menu')).toHaveCount(0);

    await toLight.click();
    await expect(toDark).toBeVisible();

    await toDark.click();
    await page.reload();
    await expect(toLight).toBeVisible();
  });
});
