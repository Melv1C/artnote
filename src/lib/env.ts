import { z } from 'zod';

// Native enum for Node environments
export enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

// Zod schema for environment validation
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.nativeEnum(NodeEnv).default(NodeEnv.DEVELOPMENT),

  // Database
  DATABASE_URL: z.string().url({
    message: 'DATABASE_URL must be a valid PostgreSQL connection string',
  }),

  // Better Auth configuration
  BETTER_AUTH_SECRET: z.string().min(10, {
    message: 'BETTER_AUTH_SECRET must be at least 10 characters long',
  }),
  BETTER_AUTH_URL: z.string().url({
    message: 'BETTER_AUTH_URL must be a valid URL',
  }),

  BLOB_READ_WRITE_TOKEN: z
    .string()
    .refine((val) => !val || val.startsWith('vercel_blob_'), {
      message:
        'BLOB_READ_WRITE_TOKEN must start with "vercel_blob_" if provided',
    }),

  // Remote image domain for Next.js image optimization
  REMOTE_IMAGE_DOMAIN: z.string().url({
    message: 'REMOTE_IMAGE_DOMAIN must be a valid URL',
  }),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(
        `Invalid environment variables:\n${errorMessages.join('\n')}`
      );
    }
    throw error;
  }
};

// Export validated environment variables
export const env = parseEnv();

// Type for the environment variables
export type Env = z.infer<typeof envSchema>;

// Helper function to check if we're in a specific environment
export const isDevelopment = () => env.NODE_ENV === NodeEnv.DEVELOPMENT;
export const isProduction = () => env.NODE_ENV === NodeEnv.PRODUCTION;
export const isTest = () => env.NODE_ENV === NodeEnv.TEST;
