import { PASSWORD, accounts, expect, test } from './fixtures';

test.describe('signing in', () => {
  test('an admin signs in from the header and reaches the dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Email').fill(accounts.admin);
    await dialog.getByLabel('Mot de passe').fill(PASSWORD);
    await dialog.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.getByText('Connexion réussie !')).toBeVisible();

    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Tableau de bord', exact: true })).toBeVisible();
  });

  test('a banned account is refused', async ({ attemptSignIn }) => {
    const response = await attemptSignIn('banned');
    expect(response.status()).toBe(403);
  });
});

test.describe('the dashboard', () => {
  test('refuses an anonymous reader', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Accès non autorisé')).toBeVisible();
  });

  test('refuses a signed-in reader with the user role', async ({ page, signIn }) => {
    await signIn('user');
    await page.goto('/dashboard/artworks');
    await expect(page.getByText('Accès non autorisé')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tableau de bord', exact: true })).toHaveCount(
      0,
    );
  });
});
