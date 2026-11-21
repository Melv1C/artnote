# Previews and staging share one database, and migrate on deploy

Every deployment runs `prisma migrate deploy` (in Vercel's build at first, when the container starts since ADR 0011), and every preview deployment and staging (`main`) use the same staging database. This keeps previews realistic without provisioning a database per branch, at the cost that a migration reaches the shared database as soon as its branch deploys. Migrations must therefore be backward compatible with the code on `main`, and destructive changes ship in two steps.
