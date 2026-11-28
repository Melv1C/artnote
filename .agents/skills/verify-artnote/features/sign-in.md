# Sign-in and access

A visitor signs in with email and password from the header, and what they can reach depends on their role: admins get a "Tableau de bord" entry and the dashboard, readers are refused from `/dashboard`, banned accounts cannot sign in.

## Sub-features

- `signin-admin` signs in an admin; the header shows their account menu with "Tableau de bord".
- `signin-reader` signs in a reader; `/dashboard` shows "Accès non autorisé" and "Votre compte n’y a pas accès."
- `signin-banned` refuses a banned account with the same alert as a wrong password, "Email ou mot de passe incorrect"; no session is created.
- `signin-anonymous` an anonymous visit to `/dashboard` shows "Accès non autorisé", "Connectez-vous avec un compte administrateur pour y accéder." and its own `button "Se connecter"`.
- `signout` "Se déconnecter" ends the session, goes to `/` and toasts "Vous êtes déconnecté".

## How to get to it (user POV)

- The "Se connecter" button at the right of the header, on any public page.
- The dialog's "Pas encore de compte ? Créer un compte" switches to sign-up (not mapped).
- Signed in: the avatar button in the header ("Compte de Admin ArtNote") opens a menu with "Mon profil", "Tableau de bord" (admins only) and "Se déconnecter".
- In the dashboard, the sidebar footer has a second account menu (its button is named by the user's name and email) with "Mon profil", "Retour au site" and "Se déconnecter".

## Driving it with playwright-cli

Preconditions:

- Baseline from the README. Space sign-ins about 10 seconds apart (Better Auth rate-limits per IP).

- **Admin sign-in.** Run `$C signin admin`. It prints `signed in as: admin@example.com`. Then `S=$($C session admin)` and `playwright-cli -s=$S --raw snapshot "getByRole('banner')"`: the banner has `button "Compte de Admin ArtNote"` and no `button "Se connecter"`.
- **Admin menu.** `playwright-cli -s=$S click "getByRole('button', { name: /Compte de/ })"` then `--raw snapshot "getByRole('menu')"`: it lists "Mon profil", "Tableau de bord", "Se déconnecter".
- **Dashboard reachable.** `playwright-cli -s=$S goto "$U/dashboard"`: `heading "Tableau de bord"`, "Bonjour Admin, voici où en est ArtNote.", the "Comptes" and "Notices publiées" cards (4 and 3 on the seed) and the "Audience" link "Voir les statistiques" (Umami, not usable locally).
- **Reader refused.** `$C signin user`, `R=$($C session user)`, `playwright-cli -s=$R goto "$U/dashboard"`, wait, then `--raw snapshot`: `heading "Accès non autorisé"`, "Votre compte n’y a pas accès.", `link "Retour à l’accueil"`, no sidebar and no `button "Se connecter"`.
- **Banned refused.** `$C signin banned` prints `banned account refused, as expected`. `playwright-cli -s=$($C session banned) --raw snapshot "getByRole('dialog', { name: 'Se connecter' })"` shows the dialog still open with an `alert` reading "Email ou mot de passe incorrect" (the server answers 403; its suspension message never reaches the UI).
- **Anonymous refused.** `playwright-cli -s=$($C session anon) open "$U/dashboard"`: "Accès non autorisé", "Connectez-vous avec un compte administrateur pour y accéder." and `button "Se connecter"`.
- **Sign out.** From a page other than `/` (`/artworks`, say), open the "Compte de …" menu and `click "getByRole('menuitem', { name: 'Se déconnecter' })"`: the URL becomes `/`, the banner shows `button "Se connecter"` again, and `eval "fetch('/api/auth/get-session').then(r => r.json())"` returns `null`.
- **Proof.** Save banner snapshots and screenshots for the admin, the reader's refusal page and the banned dialog into `$E`.

## Gotchas

- Right after load the header shows a skeleton while the session check runs; "Se connecter" appears a moment later. `$C signin` waits for it; do the same when driving by hand.
- The dialog and the header both have a button named "Se connecter": scope to `getByRole('dialog', { name: 'Se connecter' })`.
- Too many sign-ins in a row return a rate-limit error that looks like a wrong password: wait and retry before reporting a failure.
