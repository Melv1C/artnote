# Places and artists

Admins keep the catalogue of places (museums, churches…) and artists that notices refer to. Both are server-paginated tables with filters, a create form, a detail page and row actions (edit, delete).

## Sub-features

- `places-list` "Lieux" table (Nom, Type, Ville, Pays, Œuvres, Créé le) with filters "Rechercher un lieu…", type, "Ville", "Pays".
- `places-create` "Nouveau lieu" form: "Nom *", type, "Adresse", "Ville", "Pays", "Site web", "Latitude", "Longitude", "Description"; submit "Créer".
- `artists-list` artists table (Nom, Date de naissance, Date de décès, Œuvres, Créé le) with "Rechercher un artiste…" and date filters.
- `artists-create` "Nouvel artiste" form: "Prénom *", "Nom *", "Date de naissance", "Date de décès", "Biographie"; submit "Créer".
- `catalogue-row-actions` "Ouvrir le menu" on a row: "Modifier", "Supprimer".
- `catalogue-pagination` "Précédent" and "Suivant" buttons under each table.

## How to get to it (user POV)

- Dashboard sidebar links "Lieux" (`/dashboard/places`) and "Artistes" (`/dashboard/artists`).
- "Nouveau lieu" / "Nouvel artiste" links at the top of each list (`…/create`).
- A row's name link opens its page (`/dashboard/places/<id>`, `/dashboard/artists/<id>`).

## Driving it with playwright-cli

Preconditions:

- Baseline from the README. `$C signin admin`, `S=$($C session admin)`, `E=$($C evidence places-artists)`.

- **Places list.** `goto "$U/dashboard"`, `click "getByRole('link', { name: /Lieux/ })"`. `heading "Lieux"`; rows "Cathédrale Saint-Bavon" (Église, Gand, "1 œuvre") and "Musées royaux des Beaux-Arts de Belgique" (Musée).
- **Filter.** `fill "getByRole('textbox', { name: 'Ville' })" "Gand"`: only the Saint-Bavon row remains.
- **Create a place.** `click "getByRole('link', { name: 'Nouveau lieu' })"`, `fill "getByRole('textbox', { name: 'Nom *' })" "[QA] Lieu de vérification"`, choose a type in the unnamed combobox after "Nom *", fill "Ville" `Liège` and "Pays" `Belgique`, `click "getByRole('button', { name: 'Créer' })"`. The list (or the new place's page) shows the name; `$C sql "select name, type, city, \"createdById\" from place where name like '[QA]%'"` returns it with `seed-user-admin`.
- **Create an artist.** `goto "$U/dashboard/artists/create"`, fill "Prénom *" `[QA] Prénom` and "Nom *" `Vérification`, `click "getByRole('button', { name: 'Créer' })"`. `$C sql "select \"firstName\", \"lastName\" from artist where \"firstName\" like '[QA]%'"` returns the row; it appears in the artist picker of the notice editor.
- **Row actions.** On the `[QA]` row, `click` its `button "Ouvrir le menu"`, then `menuitem "Supprimer"`, and confirm in the in-page `alertdialog` with its button "Supprimer". The row disappears and the SQL count is 0.
- **Proof.** Snapshot the filtered table, the filled form and the list after create; save the SQL reads to `$E`.

## Gotchas

- Both forms have an "Annuler" and a "Créer" button; the place type combobox has no accessible name (pick it by position after "Nom *", or by its current text).
- Filters run on the server after a debounce: wait for the row set to change.
- Deleting a place in use succeeds and clears the place on its notices (`placeId` set to null). Never delete a seed place.
- Dates are text inputs; check the expected format in the form before typing.
- Leave the seed places and artists unchanged: notices on the public pages refer to them.
