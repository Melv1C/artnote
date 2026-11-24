import { expect, notices, test } from './fixtures';

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
      page.getByRole('button', { name: 'Musées royaux des Beaux-Arts de Belgique : 2 notices' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Cathédrale Saint-Bavon : 1 notice' }),
    ).toBeVisible();
    // Its only notice is a draft
    await expect(page.getByRole('button', { name: /Musée Magritte Museum/ })).toHaveCount(0);
  });

  // Two places, three notices: a group shows the total of its notices, not its number of places
  test('groups nearby places when zoomed out, adding up their notices', async ({ page }) => {
    await page.goto('/carte');
    const saintBavo = page.getByRole('button', { name: 'Cathédrale Saint-Bavon : 1 notice' });
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

  test('shows a place’s details and opens one of its notices', async ({ page }) => {
    await page.goto('/carte');
    await page
      .getByRole('button', { name: 'Musées royaux des Beaux-Arts de Belgique : 2 notices' })
      .click();

    const details = page.getByRole('region', {
      name: 'Musées royaux des Beaux-Arts de Belgique',
    });
    await expect(details.getByText('Musée · Bruxelles')).toBeVisible();
    await expect(details.getByText('2 notices', { exact: true })).toBeVisible();
    // Newest first
    const links = details.getByRole('link');
    await expect(links).toHaveCount(2);
    await expect(links.nth(0)).toHaveAccessibleName('Le Dénombrement de Bethléem');
    await expect(links.nth(1)).toHaveAccessibleName(notices.icarus.title);
    // Only above three notices
    await expect(details.getByRole('link', { name: /^Voir les/ })).toHaveCount(0);

    await details.getByRole('link', { name: notices.icarus.title }).click();
    await expect(page).toHaveURL(new RegExp(`/artworks/${notices.icarus.id}$`));
    await expect(page.getByRole('heading', { level: 1, name: notices.icarus.title })).toBeVisible();
  });
});

test.describe('the map of places on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('shows a place’s details in a panel at the bottom of the screen', async ({ page }) => {
    await page.goto('/carte');
    await page.getByRole('button', { name: 'Cathédrale Saint-Bavon : 1 notice' }).click();

    const details = page.getByRole('region', { name: 'Cathédrale Saint-Bavon' });
    await expect(details.getByText('1 notice', { exact: true })).toBeVisible();
    await expect(
      details.getByRole('link', { name: 'L’Adoration de l’Agneau mystique' }),
    ).toBeVisible();

    // The whole width of the screen, down to the tab bar, once it has slid in
    const tabBar = await page
      .getByRole('navigation', { name: 'Navigation principale' })
      .boundingBox();
    await expect
      .poll(async () => {
        const panel = await details.boundingBox();
        return panel && [panel.x, panel.width, Math.round(panel.y + panel.height)];
      })
      // Within the tab bar's top border
      .toEqual([0, 390, expect.closeTo(tabBar?.y ?? 0, -1)]);

    await details.getByRole('button', { name: 'Fermer' }).click();
    await expect(details).toHaveCount(0);
  });
});
