# Dashboard notices

A writer (an admin) manages their own notices in "Mes Notices": creates one in the editor with its place, artists and rich-text notice, edits it, changes its status (Brouillon, Publié, Archivé) and deletes it. Another writer never sees it: their list omits it and its edit URL is not found (ADR 0003).

## Sub-features

- `notices-list` "Mes Notices" shows the writer's notices with counts ("Total Notices", "Publiées", "Brouillons", "Vues Totales") and a search box.
- `notices-create` "Nouvelle Notice" opens the editor; "Créer la notice" saves and returns to the list.
- `notices-edit` "Modifier" on a card opens `/dashboard/artworks/<id>/edit` with the saved values.
- `notices-status` the card menu "Plus d'actions" changes the status; "Filtres & Tri" chooses which statuses the list shows.
- `notices-delete` the card menu "Supprimer", after a browser confirm, removes the notice.
- `notices-ownership` a second writer sees none of these notices.

## How to get to it (user POV)

- Header initials menu → "Tableau de Bord", then the sidebar link "Mes Notices" (`/dashboard/artworks`).
- "Nouvelle Notice" button at the top of "Mes Notices" (`/dashboard/artworks/create`).
- "Modifier" and "Aperçu" links, and the "Plus d'actions" menu, on each notice card.

## Driving it with playwright-cli

Preconditions:

- Baseline from the README. `$C signin admin`, `S=$($C session admin)`, `E=$($C evidence dashboard-notices)`.
- No notice titled `[QA] Notice de vérification` (`$C sql "select count(*) from artwork where title like '[QA]%'"` is 0).

- **Open the list.** `playwright-cli -s=$S goto "$U/dashboard"`, then `click "getByRole('link', { name: /Mes Notices/ })"`. The body has `heading "Mes Notices"` and `generic: 3 Notices` on the seed.
- **Open the editor.** `click "getByRole('button', { name: 'Nouvelle Notice' })"`. URL is `/dashboard/artworks/create`, `heading "Créer une nouvelle notice"`.
- **Fill the form.**
  - `fill "getByRole('textbox', { name: 'Titre *' })" "[QA] Notice de vérification"`
  - `fill "getByRole('textbox', { name: 'Année de création' })" "1950"`
  - `click "getByRole('combobox', { name: 'Statut' })"`, then `click "getByRole('option', { name: 'Publié' })"`
  - `click "getByRole('combobox').filter({ hasText: 'Sélectionner un lieu' })"`, then `click "getByRole('option', { name: /Saint-Bavon/ })"`: the combobox reads "Cathédrale Saint-Bavon, Gand, Belgique".
  - `click "getByRole('combobox').filter({ hasText: 'Sélectionner des artistes' })"`, `click "getByRole('option', { name: /Magritte/ })"`, `press Escape`: a chip "René Magritte" with `button "Supprimer René Magritte"`.
  - `click "[contenteditable=true] >> nth=0"`, `type "Texte de vérification."`
  - Save `--raw snapshot "getByRole('main').last()" > "$E/01-form.aria.yml"` and `screenshot --filename="$E/01-form.png"`.
- **Create.** `click "getByRole('button', { name: 'Créer la notice' })"`. `eval "location.pathname"` becomes `/dashboard/artworks` and the list shows `heading "[QA] Notice de vérification"` and `4 Notices`. Save `02-list.aria.yml` and `02-list.png`.
- **Stored row.** `$C sql "select a.title, a.status, a.\"creationYear\", a.\"writerId\", a.\"placeId\", a.notice, x.\"artistId\" from artwork a left join artwork_artist x on x.\"artworkId\" = a.id where a.title like '[QA]%'" > "$E/03-db.txt"`: status `PUBLISHED`, writer `seed-user-admin`, place `seed-place-saint-bavo`, artist `seed-artist-magritte`, notice `<p …>Texte de vérification.</p>`.
- **Public page.** `playwright-cli -s=$S goto "$U/artworks"` lists the notice; open it: `heading "[QA] Notice de vérification"` level 1, "René Magritte", "Cathédrale Saint-Bavon". Save `04-public.png`.
- **Edit.** Back in "Mes Notices", in the card of the notice, `click` its `link "Modifier"`. The editor shows the saved title. URL `/dashboard/artworks/<id>/edit`, `heading "Modifier la notice"`. `fill "getByRole('textbox', { name: 'Dimensions' })" "10 × 10 cm"`, `click "getByRole('button', { name: 'Mettre à jour' })"`. Back on `/dashboard/artworks`; `$C sql "select dimensions from artwork where title like '[QA]%'"` reads `10 × 10 cm`.
- **Status.** On the card, `click "getByRole('button', { name: \"Plus d'actions\" })"` (scoped to the card), then `menuitem "Archivé"`. The card leaves the list (archived notices are filtered out by default) and `$C sql` reads `ARCHIVED`; `/artworks` is back to "2 œuvres trouvées". To see the card again: `click "getByRole('button', { name: 'Filtres & Tri' })"`, `click "getByRole('menu', { name: 'Filtres & Tri' }).getByRole('combobox').first()"`, `click "getByRole('option', { name: 'Archivé' })"`, `press Escape`: the card shows the badge "Archivé".
- **Ownership.** `$C signin writer`, `W=$($C session writer)`, `goto "$U/dashboard/artworks"`: `heading "Aucune notice créée"`, no `[QA]` heading and none of the seed notices. `goto "$U/dashboard/artworks/<id>/edit"` (id from `03-db.txt`) shows `heading "404"` and "Page introuvable".
- **Delete.** As admin, card menu → `menuitem "Supprimer"`, then `dialog-accept`. The heading disappears and `$C sql "select count(*) from artwork where title like '[QA]%'"` is 0.

To scope to one card: `CARD="locator('div').filter({ has: getByRole('heading', { name: '[QA] Notice de vérification', exact: true }) }).filter({ has: getByRole('button', { name: \"Plus d'actions\" }) }).last()"`, then `click "$CARD.getByRole('button', { name: \"Plus d'actions\" })"`.

## Gotchas

- Two buttons are named "Annuler" on the editor: the first is the rich-text undo. The form's cancel is the last one.
- The Notice and Bibliographie editors have no accessible name; use `[contenteditable=true] >> nth=0` and `nth=1`.
- The place and artist pickers are comboboxes without a name; filter them by their placeholder text. The artist picker stays open after a choice: press Escape.
- "Supprimer" opens a native `confirm()`; every other command is blocked until `dialog-accept` or `dialog-dismiss`.
- A notice created as Brouillon is not on `/artworks`, and its public URL is a 404 ("Page introuvable"); that is correct, not a failure.
- "Mes Notices" shows Brouillon and Publié only; an archived notice seems to vanish until "Archivé" is added in "Filtres & Tri". Scope card lookups after archiving accordingly.
- Right after a delete, a toast can still mention the title for a few seconds: check absence with `$C sql`, or wait for the toast to go.
- "Vues Totales" stays 0 locally: views are not counted without `CLIENT_IP_HEADER`.
- Leave the seed notices unchanged; prove status changes on a `[QA]` notice.
