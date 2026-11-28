import { expect, places, test } from './fixtures';

// This test moves a seed place: put it back for a rerun
test.afterEach(async ({ db }) => {
  const { latitude, longitude } = places.groeninge;
  await db.place.update({ where: { id: places.groeninge.id }, data: { latitude, longitude } });
});

test('a writer moves a place and finds the new position when editing it again', async ({
  page,
  signIn,
}) => {
  await signIn('admin');
  await page.goto(`/dashboard/places/${places.groeninge.id}`);
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Latitude *').fill('51.2051');
  await page.getByLabel('Longitude *').fill('3.2253');
  await page.getByRole('button', { name: 'Modifier' }).click();
  await expect(page.getByText('Lieu modifié')).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard\/places$/);

  // Opened again from the list, the form shows the saved position, not the page as first opened
  const groeninge = page.getByRole('row').filter({ hasText: places.groeninge.name });
  await groeninge.getByRole('button', { name: 'Plus d’actions' }).click();
  await page.getByRole('menuitem', { name: 'Modifier' }).click();
  await expect(page).toHaveURL(new RegExp(`/dashboard/places/${places.groeninge.id}$`));
  await expect(page.getByLabel('Latitude *')).toHaveValue('51.2051');
  await expect(page.getByLabel('Longitude *')).toHaveValue('3.2253');
});
