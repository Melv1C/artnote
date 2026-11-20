import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Same precedence as the app: .env.local wins over .env
config({ path: '.env.local' });
config({ path: '.env' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'bun prisma/seed.ts',
  },
  datasource: {
    url: env('PRISMA_DATABASE_URL'),
  },
});
