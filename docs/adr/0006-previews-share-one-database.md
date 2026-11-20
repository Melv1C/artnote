# Previews and staging share one database, and migrate on deploy

Vercel runs `prisma migrate deploy` in every build, and every preview deployment and staging (`main`) use the same preview database through Prisma Accelerate. This keeps previews realistic without provisioning a database per branch, at the cost that a migration reaches the shared preview database as soon as its branch deploys. Migrations must therefore be backward compatible with the code on `main`, and destructive changes ship in two steps.
