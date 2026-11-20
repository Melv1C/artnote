# Role, status and place type are strings checked by Zod

`User.role`, `Artwork.status` and `Place.type` are plain string columns, and their allowed values live in Zod enums (`src/schemas/common.ts`) rather than Postgres enums. Better Auth owns the `role` column and expects a string, and adding a status or place type then needs no migration on the shared preview and production databases. The cost is that the database does not reject an unknown value: every write goes through a server function whose Zod schema does.
