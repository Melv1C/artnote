import { expect, notices, places, test } from './fixtures';

test.describe('a reader', () => {
  test('finds the published notices, not the drafts', async ({ page }) => {
    await page.goto('/artworks');
    await expect(page.getByRole('heading', { name: notices.icarus.title })).toBeVisible();
    await expect(page.getByText(notices.empire.title)).toHaveCount(0);
  });

  test('sees every notice, newest first, from the home page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Tout voir' }).click();
    await expect(page).toHaveURL(/\/artworks\?sort=published&order=desc$/);
    await expect(page.getByRole('combobox', { name: 'Trier les notices' })).toHaveText(
      'Dernières publiées',
    );
  });

  test('reads a published notice', async ({ page }) => {
    await page.goto(`/artworks/${notices.icarus.id}`);
    await expect(page.getByRole('heading', { level: 1, name: notices.icarus.title })).toBeVisible();
    await expect(page.getByText('Icare, lui, disparaît')).toBeVisible();
  });

  test("counts a view without changing the notice's modified date", async ({ page, db }) => {
    const where = { id: notices.icarus.id };
    const before = await db.artwork.findUniqueOrThrow({ where });
    await page.setExtraHTTPHeaders({ 'x-real-ip': '203.0.113.7' });
    try {
      await page.goto(`/artworks/${notices.icarus.id}`);
      await expect
        .poll(async () => (await db.artwork.findUniqueOrThrow({ where })).viewCount)
        .toBe(before.viewCount + 1);
      const after = await db.artwork.findUniqueOrThrow({ where });
      expect(after.updatedAt).toEqual(before.updatedAt);
    } finally {
      await db.pageView.deleteMany({ where: { artworkId: notices.icarus.id } });
      await db.artwork.update({
        where,
        data: {
          viewCount: before.viewCount,
          lastViewedAt: before.lastViewedAt,
          updatedAt: before.updatedAt,
        },
      });
    }
  });

  test('cannot open a draft notice', async ({ page }) => {
    await page.goto(`/artworks/${notices.empire.id}`);
    await expect(page.getByText('Page introuvable')).toBeVisible();
    await expect(page.getByText(notices.empire.title)).toHaveCount(0);
  });

  test('cannot preview a draft notice', async ({ page }) => {
    await page.goto(`/artworks/${notices.empire.id}/preview`);
    await expect(page.getByText('Accès non autorisé')).toBeVisible();
    await expect(page.getByText(notices.empire.title)).toHaveCount(0);
  });
});

// "Voir les N notices" on the map opens the list filtered by the place's name
test.describe('the notices list filtered by a place', () => {
  test('shows the place filter and lets the reader remove it', async ({ page }) => {
    await page.goto(`/artworks?place=${encodeURIComponent(places.saintBavo.name)}`);
    await expect(page.getByRole('status').getByText('1 notice')).toBeAttached();
    const filter = page.getByRole('button', {
      name: `Retirer le filtre Lieu : ${places.saintBavo.name}`,
    });
    await expect(filter).toBeVisible();

    await page.waitForLoadState('networkidle');
    await filter.click();
    await expect(page).toHaveURL(/\/artworks$/);
    await expect(filter).toHaveCount(0);
    await expect(page.getByRole('heading', { name: notices.icarus.title })).toBeVisible();
  });
});
