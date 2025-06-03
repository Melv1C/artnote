import { z } from 'zod';

// =============================================================================
// BASE SCHEMA
// =============================================================================

export const ConceptSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.string(),
  updatedById: z.string(),
});

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

export const CreateConceptSchema = ConceptSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
});

export const UpdateConceptSchema = CreateConceptSchema.partial();

// =============================================================================
// FORM SCHEMAS
// =============================================================================

export const ConceptFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255, 'Le nom est trop long'),
  description: z.string().optional(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Concept = z.infer<typeof ConceptSchema>;
export type CreateConcept = z.infer<typeof CreateConceptSchema>;
export type UpdateConcept = z.infer<typeof UpdateConceptSchema>;
export type ConceptForm = z.infer<typeof ConceptFormSchema>;
