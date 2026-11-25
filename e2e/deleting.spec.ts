import { expect, startNotice, test } from './fixtures';

test('a writer confirms in the page before a notice is deleted', async ({ page, signIn }) => {
  const title = `Notice à supprimer ${Date.now()}`;
  await signIn('admin');
  await startNotice(page, title);
  await page.getByRole('button', { name: 'Créer la notice' }).click();
  await expect(page).toHaveURL(/\/dashboard\/artworks$/);

  const row = page.getByRole('row').filter({ hasText: title });
  const openMenu = async () => {
    await row.getByRole('button', { name: 'Plus d’actions' }).click();
    await page.getByRole('menuitem', { name: 'Supprimer' }).click();
  };

  // Cancelling keeps the notice
  await openMenu();
  const dialog = page.getByRole('alertdialog', { name: `Supprimer « ${title} » ?` });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Annuler' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(row).toBeVisible();

  // Confirming deletes it
  await openMenu();
  await dialog.getByRole('button', { name: 'Supprimer la notice' }).click();
  await expect(page.getByText('Notice supprimée')).toBeVisible();
  await expect(row).toHaveCount(0);
});
