import { expect, test } from './fixtures';

// The tests never depend on OpenFreeMap: its styles are replaced by a blank one, so no tile loads
test.beforeEach(async ({ page }) => {
  await page.route('https://tiles.openfreemap.org/**', route =>
    route.fulfill({ json: { version: 8, sources: {}, layers: [] } }),
  );
});

test.describe('the map of places', () => {
  test('opens from the navigation', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Navigation principale' })
      .getByRole('link', { name: 'Carte' })
      .click();
    await expect(page).toHaveURL(/\/carte$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Carte des lieux' })).toBeAttached();
  });

  test('shows each place with published notices and their number', async ({ page }) => {
    await page.goto('/carte');
    await expect(
      page.getByRole('img', { name: 'Musées royaux des Beaux-Arts de Belgique : 2 notices' }),
    ).toBeVisible();
    await expect(
      page.getByRole('img', { name: 'Cathédrale Saint-Bavon : 1 notice' }),
    ).toBeVisible();
    // Its only notice is a draft
    await expect(page.getByRole('img', { name: /Musée Magritte Museum/ })).toHaveCount(0);
  });

  // Two places, three notices: a group shows the total of its notices, not its number of places
  test('groups nearby places when zoomed out, adding up their notices', async ({ page }) => {
    await page.goto('/carte');
    const saintBavo = page.getByRole('img', { name: 'Cathédrale Saint-Bavon : 1 notice' });
    await expect(saintBavo).toBeVisible();

    const group = page.getByRole('button', { name: /^3 notices dans ce groupe/ });
    const zoomOut = page.getByRole('button', { name: 'Dézoomer' });
    await expect(async () => {
      await zoomOut.click();
      await expect(group).toBeVisible({ timeout: 1_000 });
    }).toPass();
    await expect(saintBavo).toHaveCount(0);

    await group.click();
    await expect(saintBavo).toBeVisible();
  });
});
