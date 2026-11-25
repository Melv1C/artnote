import { accounts, expect, test } from './fixtures';
import type { Page } from '@playwright/test';

/** Pick a role for the seeded reader from its row's action menu in /dashboard/users. */
async function setReaderRole(page: Page, roleLabel: string) {
  await page.goto('/dashboard/users');
  await page.waitForLoadState('networkidle');
  const row = page.getByRole('row').filter({ hasText: accounts.user });
  await row.getByRole('button', { name: 'Plus d’actions' }).click();
  await page.getByRole('menuitem', { name: 'Modifier le rôle' }).hover();
  await page.getByRole('menuitem', { name: roleLabel, exact: true }).click();
  await expect(page.getByText(`Rôle mis à jour vers ${roleLabel}`)).toBeVisible();
}

test('an admin changes a reader’s role, which opens and closes the dashboard to them', async ({
  page,
  signIn,
}) => {
  await signIn('admin');
  await setReaderRole(page, 'Administrateur');

  await signIn('user');
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Tableau de bord', exact: true })).toBeVisible();

  // Back to the seeded role, which the other tests expect
  await signIn('admin');
  await setReaderRole(page, 'Utilisateur');

  await signIn('user');
  await page.goto('/dashboard');
  await expect(page.getByText('Accès non autorisé')).toBeVisible();
});
