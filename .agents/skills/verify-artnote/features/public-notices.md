# Public notices

Readers, signed in or not, browse published notices: the home page with the latest ones, the list at `/artworks` with search and sort, "Nouveautés" (`/whats-new`), and each notice's page with its details, notice text and writer. Drafts and archived notices are never shown.

## Sub-features

- `public-home` the home page (`heading "La peinture dans tout son art"`) has the "Parcourir les notices" link, a "Dernière notice" card linking to the newest notice, and "Publiées récemment" with a "Tout voir" link to `/whats-new`.
- `public-list` `/artworks` (`heading "Notices"`) lists every published notice with its count ("3 notices" on the seed, also in a `status` live region).
- `public-search` the searchbox "Rechercher une notice" matches title, artist name, place name, technique and notice text, and writes `?search=` into the URL; "Effacer la recherche" clears it. No result: `heading "Aucune notice ne correspond"` and `link "Voir toutes les notices"`.
- `public-sort` the combobox "Trier les notices" (default "Titre, de A à Z"; also by artist, creation year and publication date, each both ways) writes `?sort=&order=`.
- `public-notice` a notice page shows the artist, the title as `h1`, the year, technique and dimensions, `region "Notice"`, `region "Où voir l’œuvre"` with the place and `link "Itinéraire (nouvel onglet)"`, and "Notice rédigée par <writer>". The role "peintre" is not shown.
- `public-whats-new` `/whats-new` (`heading "Nouveautés"`) lists up to 12 notices, newest published first, each with "Publiée le <date>".
- `public-draft-hidden` a draft's URL shows the not-found page.

## How to get to it (user POV)

- Header navigation "Navigation principale": "Notices", "Carte", "Nouveautés", "À propos". On a phone the same names sit in a bottom tab bar, plus "Accueil".
- On the home page: "Parcourir les notices" (`/artworks`), the "Dernière notice" card (the notice), "Tout voir" (`/whats-new`).
- A card in a list opens `/artworks/<id>`.

## Driving it with playwright-cli

Preconditions:

- Baseline from the README. No sign-in needed: `S=$($C session reader)`, `playwright-cli -s=$S open "$U/"`. `E=$($C evidence public-notices)`.

- **Home.** `--raw snapshot "getByRole('main')"`: `heading "La peinture dans tout son art"`, "Dernière notice", `heading "Publiées récemment"`, `link "Tout voir"`.
- **Open the list.** `click "getByRole('link', { name: 'Parcourir les notices' })"`. `heading "Notices"` and "3 notices"; cards for "L’Adoration de l’Agneau mystique", "Le Dénombrement de Bethléem" and "Paysage avec la chute d’Icare", not "L’Empire des lumières".
- **Search.** `fill "getByRole('searchbox', { name: 'Rechercher une notice' })" "icare"`. The URL becomes `/artworks?search=icare` and the count "1 notice"; only the Icarus card remains. Search "Magritte" gives zero results (the only Magritte notice is a draft): `heading "Aucune notice ne correspond"` with `link "Voir toutes les notices"`.
- **Sort.** `click "getByRole('button', { name: 'Effacer la recherche' })"`, `click "getByRole('combobox', { name: 'Trier les notices' })"`, `click "getByRole('option', { name: 'Dernières publiées' })"`. The URL becomes `/artworks?sort=published&order=desc` and the first card is "L’Adoration de l’Agneau mystique".
- **Notice page.** `click "getByRole('link', { name: /Paysage avec la chute d’Icare/ })"`. URL `/artworks/seed-artwork-icarus`; `heading "Paysage avec la chute d’Icare"` level 1, "Pieter Bruegel l’Ancien", "vers 1560", the paragraph "Au premier plan, un laboureur…" in `region "Notice"`, `region "Où voir l’œuvre"` with "Musées royaux des Beaux-Arts de Belgique" and `link "Itinéraire (nouvel onglet)"`, "Notice rédigée par" Admin ArtNote. Save snapshot and screenshot.
- **Draft hidden.** `goto "$U/artworks/seed-artwork-empire"`: `heading "Page introuvable"`, `link "Parcourir les notices"` and `link "Retour à l’accueil"`.
- **Nouveautés.** `goto "$U/whats-new"`: `heading "Nouveautés"`, the 3 published notices from the newest ("L’Adoration de l’Agneau mystique") down, each with "Publiée le".
- **Proof.** Snapshots of the home, the list, the search result, the notice page, the 404 and `/whats-new`, in `$E`.

## Gotchas

- Names use the typographic apostrophe `’` ("Paysage avec la chute d’Icare"); a straight `'` does not match. Regex locators avoid the problem.
- The search is debounced: wait for the URL to change before snapshotting.
- An admin session sees the same public pages; use an unsigned session to prove what readers see.
- "Toutes les notices" is only the list's `<title>`, not a heading.
- A `?place=<name>` URL (from the map's "Voir les N notices") narrows the list to one place with a removable "Lieu : …" chip; see [Places map](./places-map.md).
- Page views and `notice_read` events are not sent locally (no Umami); the view count is not incremented locally either. Do not report them as verified here.
