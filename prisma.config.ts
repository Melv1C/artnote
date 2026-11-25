import { defineConfig, env } from 'prisma/config';
import { loadEnvFiles } from './scripts/env-files';

loadEnvFiles();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'vpx prisma/seed.ts',
  },
  datasource: {
    url: env('PRISMA_DATABASE_URL'),
  },
});
