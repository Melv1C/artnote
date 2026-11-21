import { expect, notices, test } from './fixtures';

// ADR 0003: a writer reads, edits, publishes and deletes only their own notices; another
// writer's notice is reported as not found. Every seed notice belongs to admin@example.com.
test.describe('notice ownership', () => {
  test('the writer edits their own notice', async ({ page, signIn }) => {
    await signIn('admin');
    await page.goto(`/dashboard/artworks/${notices.empire.id}/edit`);
    await expect(page.getByRole('heading', { name: 'Modifier la notice' })).toBeVisible();
    await expect(page.getByPlaceholder("Titre de l'œuvre")).toHaveValue(notices.empire.title);
  });

  test('another writer finds no such notice to edit', async ({ page, signIn }) => {
    await signIn('writer');
    await page.goto(`/dashboard/artworks/${notices.empire.id}/edit`);
    await expect(page.getByText('Page introuvable')).toBeVisible();
    await expect(page.getByPlaceholder("Titre de l'œuvre")).toHaveCount(0);
  });

  test("another writer's notice list leaves it out", async ({ page, signIn }) => {
    await signIn('writer');
    await page.goto('/dashboard/artworks');
    await expect(page.getByText('Aucune notice créée')).toBeVisible();
    await expect(page.getByText(notices.icarus.title)).toHaveCount(0);
    await expect(page.getByText(notices.empire.title)).toHaveCount(0);
  });

  test("any admin previews another writer's draft", async ({ page, signIn }) => {
    await signIn('writer');
    await page.goto(`/artworks/${notices.empire.id}/preview`);
    await expect(page.getByText('Mode Aperçu', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: notices.empire.title })).toBeVisible();
  });
});
