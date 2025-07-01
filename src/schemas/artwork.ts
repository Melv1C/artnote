import { z } from 'zod';
import { ArtworkImageSchemaSimplified } from './artwork-image';
import { ArtworkStatusSchema } from './common';

// =============================================================================
// BASE SCHEMA
// =============================================================================

export const ArtworkSchema = z.object({
  id: z.string(),
  title: z
    .string()
    .min(2, 'Le titre doit comporter au moins 2 caractères')
    .max(255, 'Le titre ne peut pas dépasser 255 caractères'),
  creationYear: z.string().nullable(),
  medium: z.string().nullable(),
  dimensions: z.string().nullable(),
  notice: z.string().nullable(),
  sources: z.string().nullable(),
  status: ArtworkStatusSchema.default(ArtworkStatusSchema.Values.DRAFT),
  publishedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  writerId: z.string(),
  placeId: z.string().nullable(),
  // Analytics fields
  viewCount: z.number().int().min(0).default(0),
  lastViewedAt: z.date().nullable(),

  images: ArtworkImageSchemaSimplified.array().default([]),
});

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

export const CreateArtworkSchema = ArtworkSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
}).extend({
  status: ArtworkStatusSchema.optional(),
});

export const UpdateArtworkSchema = CreateArtworkSchema.partial().omit({
  writerId: true,
});

// =============================================================================
// FORM SCHEMAS
// =============================================================================

export const ArtworkFormSchema = ArtworkSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  writerId: true,
  viewCount: true,
  lastViewedAt: true,
  status: true,
  images: true,

  // temporarily omit placeId for form simplicity
  placeId: true,
}).extend({
  status: ArtworkStatusSchema,
  images: ArtworkImageSchemaSimplified.array(),
  artistIds: z.array(z.string()).optional(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Artwork = z.infer<typeof ArtworkSchema>;
export type CreateArtwork = z.infer<typeof CreateArtworkSchema>;
export type UpdateArtwork = z.infer<typeof UpdateArtworkSchema>;
export type ArtworkForm = z.infer<typeof ArtworkFormSchema>;
