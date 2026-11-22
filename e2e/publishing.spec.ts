import { expect, test } from './fixtures';

test('a notice the writer publishes reaches readers', async ({ page, signIn, browser }) => {
  const title = `Notice de test ${Date.now()}`;

  await signIn('admin');
  await page.goto('/dashboard/artworks/create');
  // Type only once React has hydrated the form; earlier input is lost
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Titre *', { exact: true }).fill(title);
  await page.getByRole('combobox').filter({ hasText: 'Brouillon' }).click();
  await page.getByRole('option', { name: 'Publié' }).click();
  await page.getByRole('button', { name: 'Créer la notice' }).click();
  await expect(page.getByText('Notice créée avec succès !')).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard\/artworks$/);

  // A reader who never signed in
  const reader = await browser.newPage();
  await reader.goto('/artworks');
  await reader.getByText(title).first().click();
  await expect(reader.getByRole('heading', { level: 1, name: title })).toBeVisible();
  await reader.close();
});
