import { expect, test } from './fixtures';
import type { Page } from '@playwright/test';

/** Pick a role for an account from its row's action menu in /dashboard/users. */
async function setRole(page: Page, email: string, roleLabel: string) {
  await page.goto('/dashboard/users');
  await page.waitForLoadState('networkidle');
  const row = page.getByRole('row').filter({ hasText: email });
  await row.getByRole('button', { name: 'Plus d’actions' }).click();
  await page.getByRole('menuitem', { name: 'Modifier le rôle' }).hover();
  await page.getByRole('menuitem', { name: roleLabel, exact: true }).click();
  await expect(page.getByText(`Rôle mis à jour vers ${roleLabel}`)).toBeVisible();
}

// A reader signed up for this test, so the seeded one keeps its role whatever happens here
test('an admin changes a reader’s role, which opens and closes the dashboard to them', async ({
  page,
  signIn,
  newReader,
}) => {
  await signIn('admin');
  await setRole(page, newReader.email, 'Administrateur');

  await signIn(newReader);
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Tableau de bord', exact: true })).toBeVisible();

  await signIn('admin');
  await setRole(page, newReader.email, 'Utilisateur');

  await signIn(newReader);
  await page.goto('/dashboard');
  await expect(page.getByText('Accès non autorisé')).toBeVisible();
});
