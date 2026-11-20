# Writers own their notices; admins do not edit each other's

Every admin can write notices, but only a notice's writer can edit, publish, archive or delete it; another admin can only preview it. Notices are signed scholarly work, so we chose authorship over a shared editorial pool. Ownership is a query filter (`ownedBy`), not a permission in the role table, because Better Auth's access control has no notion of record ownership. Reassigning or co-editing notices would need a new rule, not a role change.
