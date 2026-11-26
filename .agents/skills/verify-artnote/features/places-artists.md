# Places and artists

Admins keep the catalogue of places (museums, churches…) and artists that notices refer to. Both are server-paginated tables (25 rows a page, newest first) with filters, a create form, a detail page and row actions (edit, delete). A place needs a position (latitude and longitude) to be saved; an artist needs only a first name.

## Sub-features

- `places-list` `table` with columns Nom, Type, Ville, Pays, Œuvres, Créé le; a "Sans position" badge on places without coordinates. Filters: textbox "Rechercher un lieu", combobox "Type de lieu", textboxes "Filtrer par ville" and "Filtrer par pays", toggle button "Sans position".
- `places-create` "Nouveau lieu" form: "Nom *", combobox "Type *" (Musée, Église, Espace public, Autre), "Adresse", "Ville", "Pays", "Site web", then the position: searchbox "Adresse ou nom du lieu" with "Rechercher", a map (`region "Carte"`) with a draggable marker, and spinbuttons "Latitude *" and "Longitude *"; then "Description". Submit "Créer". Without a position it refuses with "Position manquante : indiquez la latitude" and keeps what was typed.
- `artists-list` `table` with columns Nom, Date de naissance, Date de décès, Œuvres, Créé le; one filter, textbox "Rechercher un artiste".
- `artists-create` "Nouvel artiste" form: "Prénom *", "Nom" (optional, for artists known by one name), "Date de naissance", "Date de décès", "Biographie"; submit "Créer".
- `catalogue-row-actions` "Plus d’actions" on a row: "Modifier", "Supprimer".
- `catalogue-pagination` "Précédent" and "Suivant" buttons under each table (both disabled on the seed).

## How to get to it (user POV)

- Dashboard sidebar links "Lieux" (`/dashboard/places`) and "Artistes" (`/dashboard/artists`).
- "Nouveau lieu" / "Nouvel artiste" links at the top of each list (`…/create`). After "Créer", the app toasts "Lieu créé" / "Artiste créé" and returns to the list.
- A row's name link opens its page (`/dashboard/places/<id>`, `/dashboard/artists/<id>`).

## Driving it with playwright-cli

Preconditions:

- Baseline from the README. `$C signin admin`, `S=$($C session admin)`, `E=$($C evidence places-artists)`.

- **Places list.** `goto "$U/dashboard"`, `click "getByRole('link', { name: 'Lieux' })"`. `heading "Lieux"` and 4 rows: "Musée Groeninge" (badge "Sans position", "0 œuvre"), "Musée Magritte Museum" ("1 œuvre", the draft), "Cathédrale Saint-Bavon" ("1 œuvre") and "Musées royaux des Beaux-Arts de Belgique" ("2 œuvres").
- **Filter.** `fill "getByRole('textbox', { name: 'Filtrer par ville' })" "Gand"`: only the Saint-Bavon row remains. Clear it, then `click "getByRole('button', { name: 'Sans position' })"`: only "Musée Groeninge" remains. Click the toggle again to turn it off.
- **Create a place.** `click "getByRole('link', { name: 'Nouveau lieu' })"`, `fill "getByRole('textbox', { name: 'Nom *' })" "[QA] Lieu de vérification"`, `click "getByRole('combobox', { name: 'Type *' })"`, `click "getByRole('option', { name: 'Musée' })"`, `fill "getByRole('textbox', { name: 'Ville', exact: true })" "Liège"`, `fill "getByRole('textbox', { name: 'Pays', exact: true })" "Belgique"`.
  - Refusal: `click "getByRole('button', { name: 'Créer' })"`: the URL stays `/dashboard/places/create`, "Position manquante : indiquez la latitude" shows, "Nom *" still holds the name.
  - Position: `fill "getByRole('spinbutton', { name: 'Latitude *' })" "50.6326"`, `fill "getByRole('spinbutton', { name: 'Longitude *' })" "5.5797"`, snapshot the form, `click "getByRole('button', { name: 'Créer' })"`. The URL becomes `/dashboard/places` with a `[QA] Lieu de vérification` row; `$C sql "select name, type, city, latitude, longitude, \"createdById\" from place where name like '[QA]%'"` returns `MUSEUM`, `Liège`, both coordinates and `seed-user-admin`.
- **Create an artist.** `goto "$U/dashboard/artists"`, `click "getByRole('link', { name: 'Nouvel artiste' })"`, fill only "Prénom *" with `[QA] Vérification`, `click "getByRole('button', { name: 'Créer' })"`. The URL becomes `/dashboard/artists`; `$C sql "select \"firstName\", \"lastName\" from artist where \"firstName\" like '[QA]%'"` returns the row with an empty `lastName`. It appears in the artist picker of the notice editor.
- **Row actions.** On the `[QA]` row, `click "getByRole('row').filter({ hasText: '[QA] Vérification' }).getByRole('button', { name: 'Plus d’actions' })"`, then `menuitem "Supprimer"`; the `alertdialog` "Supprimer [QA] Vérification ?" opens with focus on "Annuler"; `click "getByRole('alertdialog').getByRole('button', { name: 'Supprimer' })"`. Do the same for the `[QA]` place on `/dashboard/places`. The SQL counts are 0.
- **Proof.** Snapshot the filtered table, the refused form, the filled form and the list after create; save the SQL reads to `$E`.

## Gotchas

- Use `exact: true` for the form's "Ville" and "Pays": Playwright matches substrings, and the list's "Filtrer par ville" and "Filtrer par pays" contain them.
- The address search asks Nominatim on the internet from the server; it can fail or be slow, so type the coordinates instead. Without WebGL the map shows "Carte indisponible : saisissez la latitude et la longitude."; the spinbuttons still work.
- The edit form's submit is "Modifier", not "Créer".
- Filters run on the server after a debounce: wait for the row set to change.
- Deleting a place in use succeeds and clears the place on its notices (`placeId` set to null). Never delete a seed place.
- Dates are text inputs; check the expected format in the form before typing.
- Leave the seed places and artists unchanged: notices on the public pages and the map refer to them.
