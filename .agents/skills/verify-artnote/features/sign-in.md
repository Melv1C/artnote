# Sign-in and access

A visitor signs in with email and password from the header, and what they can reach depends on their role: admins get a "Tableau de Bord" entry and the dashboard, readers are refused from `/dashboard`, banned accounts cannot sign in.

## Sub-features

- `signin-admin` signs in an admin; the header shows their initials menu with "Tableau de Bord".
- `signin-reader` signs in a reader; `/dashboard` shows "Accès non autorisé".
- `signin-banned` refuses a banned account; no session is created.
- `signin-anonymous` an anonymous visit to `/dashboard` shows "Accès non autorisé".
- `signout` "Se déconnecter" ends the session.

## How to get to it (user POV)

- The "Se connecter" button at the right of the header, on any public page.
- The dialog's "Pas encore de compte ? Créer un compte" switches to sign-up (not mapped).
- Signed in: the initials button in the header ("AA" for Admin ArtNote) opens a menu with "Mon Profil", "Tableau de Bord" (admins only) and "Se déconnecter".

## Driving it with playwright-cli

Preconditions:

- Baseline from the README. Space sign-ins about 10 seconds apart (Better Auth rate-limits per IP).

- **Admin sign-in.** Run `$C signin admin`. It prints `signed in as: admin@example.com`. Then `S=$($C session admin)` and `playwright-cli -s=$S --raw snapshot "getByRole('banner')"`: the banner has `button "AA"` and no `button "Se connecter"`.
- **Admin menu.** `playwright-cli -s=$S click "getByRole('button', { name: 'AA' })"` then `--raw snapshot "getByRole('menu')"`: it lists "Mon Profil", "Tableau de Bord", "Se déconnecter".
- **Dashboard reachable.** `playwright-cli -s=$S goto "$U/dashboard"`: `heading "Tableau de Bord"` and the "Utilisateurs Total" and "Notices Publiées" cards (4 and 2 on the seed).
- **Reader refused.** `$C signin user`, `R=$($C session user)`, `playwright-cli -s=$R goto "$U/dashboard"`, wait, then `--raw snapshot`: the page shows "Accès non autorisé" and a `link "Retour à l'accueil"`, and no sidebar.
- **Banned refused.** `$C signin banned` prints `banned account refused, as expected`. `playwright-cli -s=$($C session banned) --raw snapshot "getByRole('dialog', { name: 'Se connecter' })"` shows the dialog still open with its error message.
- **Anonymous refused.** `playwright-cli -s=$($C session anon) open "$U/dashboard"`: "Accès non autorisé".
- **Sign out.** In the admin session, open the "AA" menu and `click "getByRole('menuitem', { name: 'Se déconnecter' })"`: the banner shows `button "Se connecter"` again, and `eval "fetch('/api/auth/get-session').then(r => r.json())"` returns `null`.
- **Proof.** Save banner snapshots and screenshots for the admin, the reader's refusal page and the banned dialog into `$E`.

## Gotchas

- Right after load the header shows a skeleton while the session check runs; "Se connecter" appears a moment later. `$C signin` waits for it; do the same when driving by hand.
- The dialog and the header both have a button named "Se connecter": scope to `getByRole('dialog', { name: 'Se connecter' })`.
- The initials button's name is the user's initials ("AA"), not their name.
- Too many sign-ins in a row return a rate-limit error that looks like a wrong password: wait and retry before reporting a failure.
