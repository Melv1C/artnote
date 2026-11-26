import { artists, expect, test } from './fixtures';

// Names are unique to each run of a test: a retry finds the artist the first try created

test('a writer gives an artist dates as the sources state them', async ({ page, signIn }) => {
  const lastName = `Patinir ${Date.now()}`;
  await signIn('admin');
  await page.goto('/dashboard/artists/create');
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Prénom *', { exact: true }).fill('Joachim');
  await page.getByLabel('Nom', { exact: true }).fill(lastName);
  await page.getByLabel('Date de naissance').fill('vers 1480');
  await page.getByLabel('Date de décès').fill('05/10/1524');
  await page.getByRole('button', { name: 'Créer' }).click();

  await expect(page.getByText('Artiste créé')).toBeVisible();
  const row = page.getByRole('row').filter({ hasText: lastName });
  await expect(row).toContainText('vers 1480');
  await expect(row).toContainText('05/10/1524');
});

test('a writer creates an artist known by a single name', async ({ page, signIn }) => {
  const name = `Giotto ${Date.now()}`;
  await signIn('admin');
  await page.goto('/dashboard/artists/create');
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Prénom *', { exact: true }).fill(name);
  await page.getByRole('button', { name: 'Créer' }).click();

  await expect(page.getByText('Artiste créé')).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible();
});

test('a writer formats an artist’s biography', async ({ page, signIn, db }) => {
  const { magritte } = artists;
  await signIn('admin');
  await page.goto(`/dashboard/artists/${magritte.id}`);
  await page.waitForLoadState('networkidle');

  const biography = page.getByRole('textbox', { name: 'Biographie', exact: true });
  await expect(biography).toHaveText('Peintre surréaliste belge.');

  try {
    await biography.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.getByRole('button', { name: 'Gras', exact: true }).click();
    await page.getByRole('button', { name: 'Modifier', exact: true }).click();
    await expect(page.getByText('Artiste modifié')).toBeVisible();

    await page.goto(`/dashboard/artists/${magritte.id}`);
    await page.waitForLoadState('networkidle');
    await expect(biography.locator('strong')).toHaveText('Peintre surréaliste belge.');
  } finally {
    await db.artist.update({
      where: { id: magritte.id },
      data: { biography: magritte.biography },
    });
  }
});
