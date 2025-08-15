import { z } from 'zod/v4';

// Zod schema for environment validation
const envSchema = z.object({
  // Vercel environment
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).default('development'),

  BASE_URL: z.url().default('http://localhost:3000'),

  // Database
  PRISMA_DATABASE_URL: z.url(),

  // Better Auth configuration
  BETTER_AUTH_SECRET: z.string().min(10),

  BLOB_READ_WRITE_TOKEN: z.string().startsWith('vercel_blob_rw_'),

  // Remote image domain for Next.js image optimization
  REMOTE_IMAGE_DOMAIN: z.url().optional(),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
      throw new Error(`Invalid environment variables:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
};

// Export validated environment variables
export const env = parseEnv();

// Type for the environment variables
export type Env = z.infer<typeof envSchema>;

// Helper function to check if we're in a specific environment
export const isDevelopment = env.VERCEL_ENV === 'development';
export const isPreview = env.VERCEL_ENV === 'preview';
export const isProduction = env.VERCEL_ENV === 'production';
