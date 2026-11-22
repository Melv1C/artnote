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

test('a long address in the bibliography shows as its site, without widening the page on a phone', async ({
  page,
  signIn,
  browser,
}) => {
  const title = `Notice avec lien ${Date.now()}`;
  const address = 'https://maisondesgeants.lescollections.be/index.php/Detail/objects/286';

  await signIn('admin');
  await page.goto('/dashboard/artworks/create');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Titre *', { exact: true }).fill(title);
  await page.getByRole('combobox').filter({ hasText: 'Brouillon' }).click();
  await page.getByRole('option', { name: 'Publié' }).click();
  // The editor links an address once a space follows it
  const bibliography = page
    .locator('[data-slot="form-item"]')
    .filter({ has: page.getByText('Bibliographie', { exact: true }) })
    .locator('[contenteditable="true"]');
  await bibliography.click();
  await bibliography.pressSequentially(`Maison des Géants, ${address} (06/05/2026).`);
  await page.getByRole('button', { name: 'Créer la notice' }).click();
  await expect(page.getByText('Notice créée avec succès !')).toBeVisible();

  const reader = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await reader.goto('/artworks');
  await reader.getByText(title).first().click();
  const link = reader.getByRole('link', { name: 'maisondesgeants.lescollections.be', exact: true });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', address);
  const pageWidth = await reader.evaluate(() => document.documentElement.scrollWidth);
  expect(pageWidth).toBeLessThanOrEqual(390);
  await reader.close();
});
