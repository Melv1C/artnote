import type { Locator, Page } from '@playwright/test';
import { MAP_FIT } from '../src/features/places/lib/place-map';
import { expect, notices, places, test } from './fixtures';

// The tests never depend on OpenFreeMap: its styles are replaced by a blank one, so no tile loads
test.beforeEach(async ({ page }) => {
  await page.route('https://tiles.openfreemap.org/**', route =>
    route.fulfill({ json: { version: 8, sources: {}, layers: [] } }),
  );
});

// Without animations each zoom button click moves a whole level at once, and panels open in place
test.use({ reducedMotion: 'reduce' });

/** The group of the two seed places on the map, which only shows once zoomed out far enough. */
const seedGroup = (page: Page) => page.getByRole('button', { name: /^3 notices dans ce groupe/ });

/**
 * Click "Dézoomer" until `group` shows. How many clicks depends on the opening zoom, which fits
 * the places to the window, so the bound is the most it can take: from the closest opening zoom
 * down to the whole world.
 */
async function zoomOutUntil(page: Page, group: Locator) {
  const zoomOut = page.getByRole('button', { name: 'Dézoomer' });
  for (let click = 0; click < MAP_FIT.maxZoom; click++) {
    await zoomOut.click();
    const shown = await group.waitFor({ timeout: 1_000 }).then(
      () => true,
      () => false,
    );
    if (shown) return;
  }
  await expect(group, `a group after ${MAP_FIT.maxZoom} clicks on "Dézoomer"`).toBeVisible();
}

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

  test('opens from the footer', async ({ page }) => {
    await page.goto('/about');
    await page
      .getByRole('navigation', { name: 'Pied de page' })
      .getByRole('link', { name: 'Carte' })
      .click();
    await expect(page).toHaveURL(/\/carte$/);
  });

  test('shows each place with published notices and their number', async ({ page }) => {
    await page.goto('/carte');
    await expect(
      page.getByRole('button', { name: `${places.fineArts.name} : 2 notices` }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: `${places.saintBavo.name} : 1 notice` }),
    ).toBeVisible();
    // Its only notice is a draft
    await expect(page.getByRole('button', { name: places.magritte.name })).toHaveCount(0);
  });

  // Two places, three notices: a group shows the total of its notices, not its number of places
  test('groups nearby places when zoomed out, adding up their notices', async ({ page }) => {
    await page.goto('/carte');
    const saintBavo = page.getByRole('button', { name: `${places.saintBavo.name} : 1 notice` });
    await expect(saintBavo).toBeVisible();

    const group = seedGroup(page);
    await zoomOutUntil(page, group);
    await expect(saintBavo).toHaveCount(0);

    await group.click();
    await expect(saintBavo).toBeVisible();
  });

  test('closes a place’s bubble with Escape, back on its marker', async ({ page }) => {
    await page.goto('/carte');
    const marker = page.getByRole('button', { name: `${places.saintBavo.name} : 1 notice` });
    await marker.click();
    const details = page.getByRole('region', { name: places.saintBavo.name });
    await expect(details).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(details).toHaveCount(0);
    await expect(marker).toBeFocused();
  });

  test('closes a place’s details when zooming out merges it into a group', async ({ page }) => {
    await page.goto('/carte');
    await page.getByRole('button', { name: `${places.saintBavo.name} : 1 notice` }).click();
    const details = page.getByRole('region', { name: places.saintBavo.name });
    await expect(details).toBeVisible();

    await zoomOutUntil(page, seedGroup(page));
    await expect(details).toHaveCount(0);
  });

  test('names the map in French', async ({ page }) => {
    await page.goto('/carte');
    await expect(page.getByRole('region', { name: 'Carte' })).toBeVisible();
  });

  test('shows a place’s details and opens one of its notices', async ({ page }) => {
    await page.goto('/carte');
    await page.getByRole('button', { name: `${places.fineArts.name} : 2 notices` }).click();

    const details = page.getByRole('region', {
      name: places.fineArts.name,
    });
    await expect(details.getByText(`Musée · ${places.fineArts.city}`)).toBeVisible();
    await expect(details.getByText('2 notices', { exact: true })).toBeVisible();
    // Newest first
    const links = details.getByRole('link');
    await expect(links).toHaveCount(2);
    await expect(links.nth(0)).toHaveAccessibleName(notices.census.title);
    await expect(links.nth(1)).toHaveAccessibleName(notices.icarus.title);
    // Only above three notices
    await expect(details.getByRole('link', { name: /^Voir les/ })).toHaveCount(0);

    await details.getByRole('link', { name: notices.icarus.title }).click();
    await expect(page).toHaveURL(
      new RegExp(`/artworks/${notices.icarus.id}/paysage-avec-la-chute-d-icare$`),
    );
    await expect(page.getByRole('heading', { level: 1, name: notices.icarus.title })).toBeVisible();
  });
});

test.describe('the map of places on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('shows a place’s details in a panel at the bottom of the screen', async ({ page }) => {
    await page.goto('/carte');
    await page.getByRole('button', { name: `${places.saintBavo.name} : 1 notice` }).click();

    const details = page.getByRole('region', { name: places.saintBavo.name });
    await expect(details.getByText('1 notice', { exact: true })).toBeVisible();
    await expect(details.getByRole('link', { name: notices.lamb.title })).toBeVisible();

    // The whole width of the screen, down to the tab bar: its bottom edge within a few pixels of
    // the bar's top
    const tabBar = await page
      .getByRole('navigation', { name: 'Navigation principale' })
      .boundingBox();
    const panel = await details.boundingBox();
    expect(panel && { left: panel.x, width: panel.width }).toEqual({ left: 0, width: 390 });
    expect(Math.abs((panel?.y ?? 0) + (panel?.height ?? 0) - (tabBar?.y ?? 0))).toBeLessThan(5);

    await details.getByRole('button', { name: 'Fermer' }).click();
    await expect(details).toHaveCount(0);
  });

  test('moves focus into the panel and back to the marker when it closes', async ({ page }) => {
    await page.goto('/carte');
    const marker = page.getByRole('button', { name: `${places.saintBavo.name} : 1 notice` });
    await marker.click();
    const details = page.getByRole('region', { name: places.saintBavo.name });
    await expect(details).toBeFocused();

    await details.getByRole('button', { name: 'Fermer' }).click();
    await expect(details).toHaveCount(0);
    await expect(marker).toBeFocused();
  });

  test('has no page scroll below the map', async ({ page }) => {
    await page.goto('/carte');
    await expect(page.getByRole('button', { name: places.saintBavo.name })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
