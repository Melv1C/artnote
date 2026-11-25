import { expect, startNotice, test } from './fixtures';

test('a long address in the bibliography shows as its site, without widening the page on a phone', async ({
  page,
  signIn,
  browser,
}) => {
  const title = `Notice avec lien ${Date.now()}`;
  const address = 'https://maisondesgeants.lescollections.be/index.php/Detail/objects/286';

  await signIn('admin');
  await startNotice(page, title, { published: true });
  // The editor links an address once a space follows it
  const bibliography = page.getByRole('textbox', { name: 'Bibliographie', exact: true });
  await bibliography.click();
  await bibliography.pressSequentially(`Maison des Géants, ${address} (06/05/2026).`);
  await page.getByRole('button', { name: 'Créer la notice' }).click();
  await expect(page.getByText('Notice créée avec succès !')).toBeVisible();

  // A reader who never signed in finds it in the list
  const reader = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await reader.goto('/artworks');
  await reader.getByRole('heading', { name: title, exact: true }).click();
  await expect(reader.getByRole('heading', { level: 1, name: title })).toBeVisible();
  const link = reader.getByRole('link', { name: 'maisondesgeants.lescollections.be', exact: true });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', address);
  const pageWidth = await reader.evaluate(() => document.documentElement.scrollWidth);
  expect(pageWidth).toBeLessThanOrEqual(390);
  await reader.close();
});
