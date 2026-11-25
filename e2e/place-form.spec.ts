import { expect, places, test } from './fixtures';

// A refused save keeps what the writer typed and marks the field at fault beside it
test('creating a place without a position keeps the typed fields', async ({ page, signIn }) => {
  await signIn('admin');
  await page.goto('/dashboard/places/create');
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Nom *').fill('[QA] Musée sans position');
  await page.getByRole('combobox', { name: 'Type *' }).click();
  await page.getByRole('option', { name: 'Musée' }).click();
  await page.getByLabel('Site web').fill('https://example.com');
  await page.getByLabel('Ville').fill('Liège');
  await page.getByLabel('Description').fill('Une description tapée à la main.');
  await page.getByRole('button', { name: 'Créer' }).click();

  const latitude = page.getByLabel('Latitude *');
  await expect(latitude).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Longitude *')).toHaveAttribute('aria-invalid', 'true');
  await expect(latitude).toHaveAccessibleDescription('Position manquante : indiquez la latitude');
  await expect(page).toHaveURL(/\/dashboard\/places\/create$/);

  await expect(page.getByLabel('Nom *')).toHaveValue('[QA] Musée sans position');
  await expect(page.getByRole('combobox', { name: 'Type *' })).toHaveText('Musée');
  await expect(page.getByLabel('Site web')).toHaveValue('https://example.com');
  await expect(page.getByLabel('Ville')).toHaveValue('Liège');
  await expect(page.getByLabel('Description')).toHaveValue('Une description tapée à la main.');

  // Once fixed, it saves
  await latitude.fill('50.6326');
  await page.getByLabel('Longitude *').fill('5.5797');
  await page.getByRole('button', { name: 'Créer' }).click();
  await expect(page.getByText('Lieu créé')).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard\/places$/);
});

test('editing a place with an invalid value keeps the unsaved changes', async ({
  page,
  signIn,
}) => {
  await signIn('admin');
  await page.goto(`/dashboard/places/${places.fineArts.id}`);
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Nom *').fill('Musées royaux, nom changé');
  await page.getByLabel('Description').fill('Description changée.');
  const website = page.getByLabel('Site web');
  await website.fill('pas une adresse');
  await page.getByRole('button', { name: 'Modifier' }).click();

  await expect(website).toHaveAttribute('aria-invalid', 'true');
  await expect(website).toHaveAccessibleDescription('URL invalide');
  await expect(page.getByLabel('Nom *')).toHaveValue('Musées royaux, nom changé');
  await expect(page.getByLabel('Description')).toHaveValue('Description changée.');
  await expect(website).toHaveValue('pas une adresse');
  await expect(page).toHaveURL(new RegExp(`/dashboard/places/${places.fineArts.id}$`));
});
