import { expect, test } from './fixtures';

// A 1×1 PNG: the upload only checks the type and size
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

test('a writer sets an image legend in italics and links its source, and readers see both', async ({
  page,
  signIn,
  browser,
}) => {
  const title = `Notice illustrée ${Date.now()}`;

  await signIn('admin');
  await page.goto('/dashboard/artworks/create');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Titre *', { exact: true }).fill(title);
  await page.getByRole('combobox').filter({ hasText: 'Brouillon' }).click();
  await page.getByRole('option', { name: 'Publié' }).click();
  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: 'icare.png', mimeType: 'image/png', buffer: PIXEL });

  // Selecting words offers their formatting in a bubble above them
  const bubble = page.getByRole('toolbar', { name: 'Mise en forme' });
  const legend = page.getByRole('textbox', { name: 'Légende de l’image 1' });
  await legend.click();
  await legend.pressSequentially('Paysage avec la chute d’Icare');
  // One line: Enter adds no second paragraph
  await legend.press('Enter');
  await legend.pressSequentially(', vers 1560');
  // Select the title only, the way a writer would with the keyboard
  await legend.press('Home');
  for (const _ of 'Paysage avec la chute d’Icare') await legend.press('Shift+ArrowRight');
  await bubble.getByRole('button', { name: 'Italique', exact: true }).click();

  const source = page.getByRole('textbox', { name: 'Source de l’image 1' });
  await source.click();
  await source.pressSequentially('KIK-IRPA, Bruxelles');
  await source.press('Shift+Home');
  await bubble.getByRole('button', { name: 'Lien', exact: true }).click();
  const address = page.getByRole('textbox', { name: 'Adresse du lien' });
  await address.fill('kikirpa.be');
  // Enter applies the link, without saving the notice
  await address.press('Enter');
  await expect(page).toHaveURL(/\/dashboard\/artworks\/create$/);

  await page.getByRole('button', { name: 'Créer la notice' }).click();
  await expect(page.getByText('Notice créée avec succès !')).toBeVisible();

  const reader = await browser.newPage();
  await reader.goto('/artworks');
  await reader.getByText(title).first().click();
  await expect(reader.getByRole('heading', { level: 1, name: title })).toBeVisible();
  const caption = reader.locator('p', { hasText: 'Paysage avec la chute d’Icare, vers 1560' });
  await expect(caption).toHaveCount(1);
  await expect(caption.locator('em')).toHaveText('Paysage avec la chute d’Icare');
  await expect(reader.getByRole('link', { name: 'KIK-IRPA, Bruxelles' })).toHaveAttribute(
    'href',
    'https://kikirpa.be',
  );
  await reader.close();
});
