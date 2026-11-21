import { expect, test } from './fixtures';

test('a writer gives an artist dates as the sources state them', async ({ page, signIn }) => {
  await signIn('admin');
  await page.goto('/dashboard/artists/create');
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Prénom *', { exact: true }).fill('Joachim');
  await page.getByLabel('Nom *', { exact: true }).fill('Patinir');
  await page.getByLabel('Date de naissance').fill('vers 1480');
  await page.getByLabel('Date de décès').fill('05/10/1524');
  await page.getByRole('button', { name: 'Créer' }).click();

  await expect(page.getByText('Artiste créé')).toBeVisible();
  const row = page.getByRole('row').filter({ hasText: 'Patinir' });
  await expect(row).toContainText('vers 1480');
  await expect(row).toContainText('05/10/1524');
});
