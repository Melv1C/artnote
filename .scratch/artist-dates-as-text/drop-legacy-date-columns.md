# Drop the artist's legacy date columns

**Status:** ready
**Blocked by:** a production release that includes the free-text artist dates (GitHub #98)

Artist birth and death dates became free text in the `birthDateText` and `deathDateText` columns. The former `DateTime` columns `birthDate` and `deathDate` stay in the database, unread, as `legacyBirthDate` and `legacyDeathDate` in `prisma/schema.prisma`, so the code on `main` and in production kept working while the change rolled out (ADR 0006).

Once production runs that release:

- Remove `legacyBirthDate` and `legacyDeathDate` from `prisma/schema.prisma` and create the migration that drops the two columns (`bun run prisma:migrate --name drop_artist_legacy_dates`).
- Before dropping, compare the old and text columns on staging: while a preview had migrated staging but `main` still ran the old code, artists it created or edited got only the old dates. Re-run the backfill's `UPDATE` for rows whose text columns are empty if needed.
- Keep the `birthDateText` / `deathDateText` column names: `@map` already hides them, and renaming them is another two-step migration (ADR 0006).
