# Dashboard notices

A writer (an admin) manages their own notices in "Mes notices": creates one in the editor with its place, artists and rich-text notice, edits it, changes its status (Brouillon, Publiée, Archivée) and deletes it. Another writer never sees it: their list omits it and its edit URL is not found (ADR 0003).

## Sub-features

- `notices-list` "Mes notices" shows the writer's notices as a table (role `table` "Mes notices") with counts ("Notices", "Publiées", "Brouillons", "Vues"), status views (toggle buttons whose names end with their count: "En cours 4", "Brouillons 1", "Publiées 3", "Archivées 0" on the seed) and a search box "Rechercher par titre, technique ou date".
- `notices-create` "Nouvelle notice" opens the editor; "Créer la notice" saves and returns to the list.
- `notices-edit` the title link or "Modifier" (wide screens; in the row menu on narrow ones) on a row opens `/dashboard/artworks/<id>/edit` with the saved values.
- `notices-status` the row menu "Plus d’actions" changes the status ("Publier", "Repasser en brouillon", "Archiver"); the status views and "Filtres et tri" choose which statuses the list shows.
- `notices-delete` the row menu "Supprimer", confirmed in the in-page dialog, removes the notice.
- `notices-ownership` a second writer sees none of these notices.

## How to get to it (user POV)

- Header account menu ("Compte de …") → "Tableau de bord", then the sidebar link "Mes notices" (`/dashboard/artworks`).
- "Nouvelle notice" link at the top of "Mes notices", or the dashboard home's quick action "Nouvelle notice Commencer un brouillon" in the "Ajouter" box (`/dashboard/artworks/create`).
- "Modifier" and "Aperçu (nouvel onglet)" links, and the "Plus d’actions" menu, on each notice row.

## Driving it with playwright-cli

Preconditions:

- Baseline from the README. `$C signin admin`, `S=$($C session admin)`, `E=$($C evidence dashboard-notices)`.
- No notice titled `[QA] Notice de vérification` (`$C sql "select count(*) from artwork where title like '[QA]%'"` is 0).

- **Open the list.** `playwright-cli -s=$S goto "$U/dashboard"`, then `click "getByRole('link', { name: 'Mes notices', exact: true })"` (without `exact`, it also matches the home's "Toutes mes notices" and fails in strict mode). The body has `heading "Mes notices"` and `table "Mes notices"` with 4 notice rows on the seed (5 `row`s with the header).
- **Open the editor.** `click "getByRole('link', { name: 'Nouvelle notice' })"`. URL is `/dashboard/artworks/create`, `heading "Nouvelle notice"`.
- **Fill the form.**
  - `fill "getByRole('textbox', { name: 'Titre *' })" "[QA] Notice de vérification"`
  - `fill "getByRole('textbox', { name: 'Année de création' })" "1950"`
  - `click "getByRole('combobox', { name: 'Statut' })"`, then `click "getByRole('option', { name: 'Publiée', exact: true })"` (options: "Brouillon", "Publiée", "Archivée")
  - `click "getByRole('combobox').filter({ hasText: 'Sélectionner un lieu' })"`, then `click "getByRole('option', { name: /Saint-Bavon/ })"`: the combobox reads "Cathédrale Saint-Bavon, Gand, Belgique".
  - `click "getByRole('combobox').filter({ hasText: 'Sélectionner des artistes' })"`, `click "getByRole('option', { name: /Magritte/ })"`, `press Escape`: the picker reads "1 artiste" and a chip "René Magritte" has `button "Supprimer René Magritte"`.
  - `click "getByRole('textbox', { name: 'Notice', exact: true })"`, `type "Texte de vérification."`
  - Save `--raw snapshot "getByRole('main').last()" > "$E/01-form.aria.yml"` and `screenshot --filename="$E/01-form.png"`.
- **Create.** `click "getByRole('button', { name: 'Créer la notice' })"`. `eval "location.pathname"` becomes `/dashboard/artworks` and the table shows a row with `link "[QA] Notice de vérification"`. Save `02-list.aria.yml` and `02-list.png`.
- **Stored row.** `$C sql "select a.title, a.status, a.\"creationYear\", a.\"writerId\", a.\"placeId\", a.notice, x.\"artistId\" from artwork a left join artwork_artist x on x.\"artworkId\" = a.id where a.title like '[QA]%'" > "$E/03-db.txt"`: status `PUBLISHED`, writer `seed-user-admin`, place `seed-place-saint-bavo`, artist `seed-artist-magritte`, notice `<p …>Texte de vérification.</p>`.
- **Public page.** `playwright-cli -s=$S goto "$U/artworks"` reads "4 notices" and lists it; open it: `heading "[QA] Notice de vérification"` level 1, "René Magritte", "Cathédrale Saint-Bavon". Save `04-public.png`.
- **Edit.** Back in "Mes notices", in the row of the notice, `click` its title link. The editor shows the saved title. URL `/dashboard/artworks/<id>/edit`, `heading "Modifier la notice"`. `fill "getByRole('textbox', { name: 'Dimensions' })" "10 × 10 cm"`, `click "getByRole('button', { name: 'Mettre à jour' })"`. Back on `/dashboard/artworks`; `$C sql "select dimensions from artwork where title like '[QA]%'"` reads `10 × 10 cm`.
- **Status.** On the row, `click "$ROW.getByRole('button', { name: 'Plus d’actions' })"`, then `menuitem "Archiver"`. The row leaves the list (the default view "En cours" hides archives) and `$C sql` reads `ARCHIVED`; `/artworks` is back to "3 notices". To see the row again: `click "getByRole('button', { name: /Archivées/ })"`: it shows the badge "Archivée".
- **Ownership.** `$C signin writer`, `W=$($C session writer)`, `goto "$U/dashboard/artworks"`: `heading "Aucune notice créée"`, no `[QA]` heading and none of the seed notices. `goto "$U/dashboard/artworks/<id>/edit"` (id from `03-db.txt`) shows `heading "Page introuvable"`.
- **Delete.** As admin, on the "Archivées" view, row menu → `menuitem "Supprimer"`, the `alertdialog` "Supprimer « [QA] Notice de vérification » ?" opens with focus on "Annuler"; `click "getByRole('alertdialog').getByRole('button', { name: 'Supprimer la notice' })"`. The row disappears and `$C sql "select count(*) from artwork where title like '[QA]%'"` is 0.

To scope to one row: `ROW="getByRole('row').filter({ hasText: '[QA] Notice de vérification' })"`, then `click "$ROW.getByRole('button', { name: 'Plus d’actions' })"`.

## Gotchas

- Three buttons are named "Annuler" on the editor: the undo buttons of the Notice and Bibliographie toolbars, then the form's cancel, the last one, in the sticky bar at the bottom; with unsaved changes it asks "Quitter sans enregistrer ?" first.
- The Notice and Bibliographie editors are textboxes named "Notice" and "Bibliographie" (they had no name before; `[contenteditable=true] >> nth=0` still works but is fragile).
- The place and artist pickers are comboboxes without a name; filter them by their placeholder text ("Sélectionner un lieu…", "Sélectionner des artistes…"). A place option's name runs the place and city together ("Cathédrale Saint-BavonGand, Belgique"): pick it with a regex. The artist picker stays open after a choice: press Escape.
- "Supprimer" opens an in-page `alertdialog`, not a native `confirm()`; `dialog-accept` does nothing here.
- A notice created as Brouillon is not on `/artworks`, and its public URL is a 404 ("Page introuvable"); that is correct, not a failure.
- "Mes notices" opens on the view "En cours" (Brouillon and Publiée); an archived notice shows under "Archivées". Scope row lookups after archiving accordingly.
- Right after a delete, a toast can still mention the title for a few seconds: check absence with `$C sql`, or wait for the toast to go.
- "Vues" stays 0 locally: views are not counted without `CLIENT_IP_HEADER`.
- A row click right after `goto` has been seen to do nothing, and once to hang, while `.verify/state/dev.log` showed a "Hydration failed" for the relative dates ("il y a 4 minutes" on the server, "il y a 5 minutes" in the browser). Check `location.pathname` after every click that should navigate; if it did not, run `$C doctor`, then snapshot and retry.
- Leave the seed notices unchanged; prove status changes on a `[QA]` notice.
