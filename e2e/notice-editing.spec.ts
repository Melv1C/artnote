import { expect, startNotice, test } from './fixtures';

test('a writer reopens a notice they just edited and finds the saved values', async ({
  page,
  signIn,
}) => {
  const title = `Notice à réviser ${Date.now()}`;
  await signIn('admin');
  await startNotice(page, title);
  await page.getByRole('button', { name: 'Créer la notice' }).click();
  await expect(page).toHaveURL(/\/dashboard\/artworks$/);

  const row = page.getByRole('row').filter({ hasText: title });
  const titleField = page.getByLabel('Titre *', { exact: true });
  const openEditor = async () => {
    await row.getByRole('link', { name: title }).click();
    await expect(page).toHaveURL(/\/dashboard\/artworks\/[^/]+\/edit$/);
  };

  await openEditor();
  await page.waitForLoadState('networkidle');
  await titleField.fill(`${title} révisée`);
  await page.getByRole('button', { name: 'Mettre à jour' }).click();
  await expect(page).toHaveURL(/\/dashboard\/artworks$/);
  await expect(row).toContainText(`${title} révisée`);

  // Opened again from the list, the editor shows the saved title, not the notice as first opened
  await openEditor();
  await expect(titleField).toHaveValue(`${title} révisée`);
});
