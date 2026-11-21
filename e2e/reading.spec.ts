import { expect, notices, test } from './fixtures';

test.describe('a reader', () => {
  test('finds the published notices, not the drafts', async ({ page }) => {
    await page.goto('/artworks');
    await expect(page.getByText(notices.icarus.title).first()).toBeVisible();
    await expect(page.getByText(notices.empire.title)).toHaveCount(0);
  });

  test('reads a published notice', async ({ page }) => {
    await page.goto(`/artworks/${notices.icarus.id}`);
    await expect(page.getByRole('heading', { level: 1, name: notices.icarus.title })).toBeVisible();
    await expect(page.getByText('Icare, lui, disparaît')).toBeVisible();
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
