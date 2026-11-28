import { expect, startNotice, test } from './fixtures';

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
  await startNotice(page, title, { published: true });
  const fileChooser = page.waitForEvent('filechooser');
  await page.getByText('cliquez pour parcourir').click();
  await (await fileChooser).setFiles({ name: 'icare.png', mimeType: 'image/png', buffer: PIXEL });

  // Selecting words offers their formatting in a bubble above them, named after the field
  const bubble = (field: string) => page.getByRole('toolbar', { name: `Mise en forme : ${field}` });
  const legend = page.getByRole('textbox', { name: 'Légende de l’image 1' });
  await legend.click();
  await legend.pressSequentially('Paysage avec la chute d’Icare');
  // One line: Enter adds no second paragraph
  await legend.press('Enter');
  await legend.pressSequentially(', vers 1560');
  // Select the title only, the way a writer would with the keyboard (arrows: Home does not move
  // the caret on macOS)
  for (const _ of ', vers 1560') await legend.press('ArrowLeft');
  for (const _ of 'Paysage avec la chute d’Icare') await legend.press('Shift+ArrowLeft');
  await bubble('Légende de l’image 1')
    .getByRole('button', { name: 'Italique', exact: true })
    .click();

  const source = page.getByRole('textbox', { name: 'Source de l’image 1' });
  await source.click();
  await source.pressSequentially('KIK-IRPA, Bruxelles');
  for (const _ of 'KIK-IRPA, Bruxelles') await source.press('Shift+ArrowLeft');
  await bubble('Source de l’image 1').getByRole('button', { name: 'Lien', exact: true }).click();
  const address = page.getByRole('textbox', { name: 'Adresse du lien' });
  await address.fill('kikirpa.be');
  // Enter applies the link, without saving the notice
  await address.press('Enter');
  await expect(page).toHaveURL(/\/dashboard\/artworks\/create$/);

  await page.getByRole('button', { name: 'Créer la notice' }).click();
  await expect(page.getByText('Notice créée avec succès !')).toBeVisible();

  const reader = await browser.newPage();
  await reader.goto('/artworks');
  await reader.getByRole('heading', { name: title, exact: true }).click();
  await expect(reader.getByRole('heading', { level: 1, name: title })).toBeVisible();
  const caption = reader.getByText('Paysage avec la chute d’Icare, vers 1560');
  await expect(caption).toHaveCount(1);
  await expect(caption.getByRole('emphasis')).toHaveText('Paysage avec la chute d’Icare');
  await expect(reader.getByRole('link', { name: 'KIK-IRPA, Bruxelles' })).toHaveAttribute(
    'href',
    'https://kikirpa.be',
  );
  await reader.close();
});
