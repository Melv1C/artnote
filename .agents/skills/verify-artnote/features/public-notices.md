# Public notices

Readers, signed in or not, browse published notices: the list at `/artworks` with search and sort, and each notice's page with its details, notice text and writer. Drafts and archived notices are never shown.

## Sub-features

- `public-list` "Toutes les notices" lists every published notice with its count ("2 œuvres trouvées" on the seed).
- `public-search` the search box filters by title, artist or keyword and writes `?search=` into the URL.
- `public-sort` "Trier par" changes the order (default "Titre (A-Z)").
- `public-notice` a notice page shows title, artist and role, "Informations sur l'œuvre", the notice text and "Notice rédigée par <writer>".
- `public-draft-hidden` a draft's URL shows the 404 page.
- `public-home` the home page links to the list and to the latest notice.

## How to get to it (user POV)

- Header link "Notices", or "Voir toutes les notices" on the home page (`/artworks`).
- "Dernière notice publiée" on the home page, or header "Nouveautés" (`/whats-new`).
- A card in the list opens `/artworks/<id>`.

## Driving it with playwright-cli

Preconditions:

- Baseline from the README. No sign-in needed: `S=$($C session reader)`, `playwright-cli -s=$S open "$U/"`. `E=$($C evidence public-notices)`.

- **Open the list.** `click "getByRole('link', { name: 'Parcourir les notices' })"` (or the "Notices" tab on a phone). `heading "Notices"` and "2 notices"; links for "L’Adoration de l’Agneau mystique" and "Paysage avec la chute d’Icare", not "L’Empire des lumières".
- **Search.** `fill "getByRole('searchbox', { name: 'Rechercher une notice' })" "icare"`. The URL becomes `/artworks?search=icare` and the count "1 notice"; only the Icarus card remains. Search "Magritte" gives zero results (the only Magritte notice is a draft): "Aucune notice ne correspond" with `link "Voir toutes les notices"`.
- **Sort.** Clear the search, `click "getByRole('combobox', { name: 'Trier les notices' })"`, choose another option, and check the card order and URL change.
- **Notice page.** `click "getByRole('link', { name: /Paysage avec la chute d’Icare/ })"`. URL `/artworks/seed-artwork-icarus`; `heading "Paysage avec la chute d’Icare"` level 1, "Pieter Bruegel l’Ancien", "vers 1560", the paragraph "Au premier plan, un laboureur…", `region "Où voir l’œuvre"` with "Musées royaux des Beaux-Arts de Belgique" and `link "Itinéraire"`, "Notice rédigée par Admin ArtNote". Save snapshot and screenshot.
- **Draft hidden.** `goto "$U/artworks/seed-artwork-empire"`: `heading "Page introuvable"`, `link "Retour à l’accueil"`.
- **Proof.** Snapshots of the list, the search result and the notice page, plus the 404, in `$E`.

## Gotchas

- Names use the typographic apostrophe `’` ("Paysage avec la chute d’Icare"); a straight `'` does not match. Regex locators avoid the problem.
- The search is debounced: wait for the URL to change before snapshotting.
- An admin session sees the same public pages; use an unsigned session to prove what readers see.
- The notice text renders inside a read-only editor (`textbox` in the snapshot), not a plain paragraph block.
- Page views and `notice_read` events are not sent locally (no Umami); the view count is not incremented locally either. Do not report them as verified here.
