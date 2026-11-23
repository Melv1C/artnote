import { expect, test } from './fixtures';

test.describe('the theme button', () => {
  test('switches between light and dark on each click, and keeps the choice', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const html = page.locator('html');
    await expect(html).toHaveClass(/\blight\b/);

    // One click switches theme: there is no menu and no "like the device" choice
    await page.getByRole('button', { name: 'Passer au thème sombre' }).click();
    await expect(html).toHaveClass(/\bdark\b/);
    await expect(page.getByRole('menu')).toHaveCount(0);

    await page.getByRole('button', { name: 'Passer au thème clair' }).click();
    await expect(html).toHaveClass(/\blight\b/);

    await page.getByRole('button', { name: 'Passer au thème sombre' }).click();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Passer au thème clair' })).toBeVisible();
    await expect(html).toHaveClass(/\bdark\b/);
  });
});
