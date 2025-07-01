import { z } from 'zod';

// =============================================================================
// BASE SCHEMA
// =============================================================================

export const ImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  alt: z.string().nullable(),
  caption: z.string().nullable(),
  width: z.number().positive().nullable(),
  height: z.number().positive().nullable(),
  size: z.number().positive().nullable(),
  mimeType: z.string().nullable(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Image = z.infer<typeof ImageSchema>;