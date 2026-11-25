import { expect, places, test } from './fixtures';

// One test, in order: filling in the seed's place without a position changes what the filter lists
test('a writer finds the places without a position and fills one in', async ({ page, signIn }) => {
  await signIn('admin');
  await page.goto('/dashboard/places');
  await page.waitForLoadState('networkidle');

  const groeninge = page.getByRole('row').filter({ hasText: places.groeninge.name });
  const fineArts = page.getByRole('row').filter({ hasText: places.fineArts.name });
  await expect(groeninge).toContainText('Sans position');
  await expect(fineArts).toBeVisible();
  await expect(fineArts).not.toContainText('Sans position');

  // The filter keeps only places without a position, and combines with the type filter
  const filter = page.getByRole('button', { name: 'Sans position' });
  await filter.click();
  await expect(groeninge).toBeVisible();
  await expect(fineArts).toHaveCount(0);
  await expect(page.getByRole('row').filter({ hasText: places.saintBavo.name })).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Type de lieu' }).click();
  await page.getByRole('option', { name: 'Église' }).click();
  await expect(page.getByText('Aucun lieu trouvé.')).toBeVisible();
  await expect(groeninge).toHaveCount(0);

  // Saving without a position is refused
  await page.goto(`/dashboard/places/${places.groeninge.id}`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Modifier' }).click();
  await expect(page.getByText('Position manquante : indiquez la latitude')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/dashboard/places/${places.groeninge.id}$`));

  // With a position it saves, and the badge goes away
  await page.getByLabel('Latitude *').fill('51.2049');
  await page.getByLabel('Longitude *').fill('3.2248');
  // Enter, as the error toast may cover the button
  await page.getByLabel('Longitude *').press('Enter');
  await expect(page.getByText('Lieu modifié')).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard\/places$/);
  await expect(groeninge).toBeVisible();
  await expect(groeninge).not.toContainText('Sans position');

  await page.getByRole('button', { name: 'Sans position' }).click();
  await expect(page.getByText('Aucun lieu trouvé.')).toBeVisible();
});
