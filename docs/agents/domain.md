# Domain docs

How agents and skills use this repo's domain documentation.

ArtNote is a single context:

- `GLOSSARY.md` at the root defines the domain language (notice, writer, author, view count…). Use its terms in code, issues, PRs and tests, and avoid the words it lists under _Avoid_. AGENTS.md maps the terms that carry other names in code.
- `docs/adr/` records the architecture decisions (`0001-notices-are-stored-as-artwork-records.md` onwards). Read the ones that touch the area you change.

When an output contradicts an ADR, say so explicitly instead of silently overriding it:

> _Contradicts ADR 0003 (writers own their notices), but worth reopening because…_

When a concept you need is missing from the glossary, either you are inventing language the project does not use, or there is a real gap: add the term with the `domain-modeling` skill. Record a new ADR only for a decision that is hard to reverse, surprising without context, and the result of a real trade-off.
