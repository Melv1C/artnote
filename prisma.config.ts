import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Load .env.local first, then fall back to .env (same precedence as the app)
config({ path: '.env.local' });
config({ path: '.env' });

export default defineConfig({
  // Path to the Prisma schema file
  schema: 'prisma/schema.prisma',

  // Migrations configuration
  migrations: {
    path: 'prisma/migrations',
  },

  // Database connection configuration
  datasource: {
    // Use the Prisma Accelerate URL for database operations
    url: env('PRISMA_DATABASE_URL'),
  },
});
