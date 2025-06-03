import { z } from 'zod';

// =============================================================================
// BASE SCHEMA
// =============================================================================

export const KeywordSchema = z.object({
  id: z.string(),
  name: z.string(),
  definition: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.string(),
  updatedById: z.string(),
});

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

export const CreateKeywordSchema = KeywordSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
});

export const UpdateKeywordSchema = CreateKeywordSchema.partial();

// =============================================================================
// FORM SCHEMAS
// =============================================================================

export const KeywordFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255, 'Le nom est trop long'),
  definition: z.string().optional(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Keyword = z.infer<typeof KeywordSchema>;
export type CreateKeyword = z.infer<typeof CreateKeywordSchema>;
export type UpdateKeyword = z.infer<typeof UpdateKeywordSchema>;
export type KeywordForm = z.infer<typeof KeywordFormSchema>;
