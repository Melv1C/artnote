import { expect, notices, places, test } from './fixtures';

// French readers search without accents: "denombrement" finds "Dénombrement", and the other way round

test('a reader finds notices by their title or place without typing accents', async ({ page }) => {
  await page.goto('/artworks');
  await page.waitForLoadState('networkidle');
  const search = page.getByRole('searchbox', { name: 'Rechercher une notice' });

  const heading = (title: string) => page.getByRole('heading', { name: title });
  await expect(heading(notices.icarus.title)).toBeVisible();

  // The whole list shows until the search applies: wait for the other notices to go first
  await search.fill('denombrement');
  await expect(heading(notices.icarus.title)).toHaveCount(0);
  await expect(heading(notices.census.title)).toBeVisible();

  await search.fill('CATHEDRALE');
  await expect(heading(notices.census.title)).toHaveCount(0);
  await expect(heading(notices.lamb.title)).toBeVisible();

  await search.fill('pàysage');
  await expect(heading(notices.lamb.title)).toHaveCount(0);
  await expect(heading(notices.icarus.title)).toBeVisible();
});

test('a writer searches the dashboard lists without typing accents', async ({ page, signIn }) => {
  await signIn('admin');
  const lists = [
    {
      path: '/dashboard/artworks',
      box: 'Rechercher par titre',
      text: 'bethleem',
      found: notices.census.title,
      other: notices.icarus.title,
    },
    {
      path: '/dashboard/artists',
      box: 'Rechercher un artiste',
      text: 'rene',
      found: 'René Magritte',
      other: 'Jan van Eyck',
    },
    {
      path: '/dashboard/places',
      box: 'Rechercher un lieu',
      text: 'musee groeninge',
      found: places.groeninge.name,
      other: places.saintBavo.name,
    },
  ];
  for (const { path, box, text, found, other } of lists) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('row').filter({ hasText: other })).toBeVisible();
    await page.getByRole('textbox', { name: box }).fill(text);
    await expect(page.getByRole('row').filter({ hasText: other })).toHaveCount(0);
    await expect(page.getByRole('row').filter({ hasText: found })).toBeVisible();
  }
});
