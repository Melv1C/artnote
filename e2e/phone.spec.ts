import { expect, notices, places, test } from './fixtures';

// The reader's side is built for phones first
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test.describe('a reader on a phone', () => {
  test('moves between sections with the tab bar', async ({ page }) => {
    await page.goto('/');
    const tabs = page.getByRole('navigation', { name: 'Navigation principale' });
    await expect(tabs.getByRole('link', { name: 'Accueil' })).toBeVisible();

    await tabs.getByRole('link', { name: 'Notices' }).click();
    await expect(page).toHaveURL(/\/artworks$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Notices' })).toBeVisible();

    await tabs.getByRole('link', { name: 'Carte' }).click();
    await expect(page).toHaveURL(/\/carte$/);
  });

  test('searches the notices and clears a search that finds nothing', async ({ page }) => {
    await page.goto('/artworks');
    await page.waitForLoadState('networkidle');
    await page.getByRole('searchbox', { name: 'Rechercher une notice' }).fill('zzzz');
    await expect(page.getByText('Aucune notice ne correspond')).toBeVisible();

    await page.getByRole('link', { name: 'Voir toutes les notices' }).click();
    await expect(page.getByRole('heading', { name: notices.icarus.title })).toBeVisible();
    await expect(page.getByRole('searchbox', { name: 'Rechercher une notice' })).toHaveValue('');
  });

  test('finds where to see the work, with a link to a map', async ({ page }) => {
    await page.goto(`/artworks/${notices.icarus.id}`);
    const place = page.getByRole('region', { name: 'Où voir l’œuvre' });
    await expect(place.getByText(places.fineArts.name)).toBeVisible();
    await expect(place.getByRole('link', { name: /Itinéraire/ })).toHaveAttribute(
      'href',
      /google\.com\/maps/,
    );
  });
});
