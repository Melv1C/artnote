import { expect, startNotice, test } from './fixtures';

test('a writer leaving an unsaved notice is asked first', async ({ page, signIn }) => {
  await signIn('admin');
  await startNotice(page, 'Brouillon jamais enregistré');

  // Leaving by the sidebar, not only by "Annuler", is caught
  const sidebarLink = page
    .getByRole('navigation', { name: 'Gestion' })
    .getByRole('link', { name: 'Mes notices' });
  await sidebarLink.click();
  const dialog = page.getByRole('alertdialog', { name: 'Quitter sans enregistrer ?' });
  await expect(dialog).toBeVisible();

  // Staying keeps the text
  await dialog.getByRole('button', { name: 'Annuler' }).click();
  await expect(page).toHaveURL(/\/dashboard\/artworks\/create$/);
  await expect(page.getByLabel('Titre *', { exact: true })).toHaveValue(
    'Brouillon jamais enregistré',
  );

  // Leaving drops it
  await sidebarLink.click();
  await dialog.getByRole('button', { name: 'Quitter sans enregistrer' }).click();
  await expect(page).toHaveURL(/\/dashboard\/artworks$/);
});
