import { z } from 'zod';
import { PaginationSchema, SearchSchema } from './common';

// =============================================================================
// BASE SCHEMA
// =============================================================================

export const ArtistSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  birthDate: z.date().nullable(),
  deathDate: z.date().nullable(),
  biography: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.string(),
  updatedById: z.string(),
});

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

export const CreateArtistSchema = ArtistSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
}).extend({
  birthDate: z.string().optional().nullable(),
  deathDate: z.string().optional().nullable(),
});

export const UpdateArtistSchema = CreateArtistSchema.partial();

// =============================================================================
// QUERY/FILTER SCHEMAS
// =============================================================================

export const ArtistFiltersSchema = z
  .object({
    name: z.string().optional(),
    bornAfter: z.string().optional(),
    bornBefore: z.string().optional(),
  })
  .merge(SearchSchema)
  .merge(PaginationSchema);

// =============================================================================
// FORM SCHEMAS
// =============================================================================

export const ArtistFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .max(100, 'Le prénom est trop long'),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom est trop long'),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  biography: z.string().optional(),
});

// =============================================================================
// EXTENDED SCHEMAS
// =============================================================================

export const ArtistWithArtworksSchema = ArtistSchema.extend({
  artworks: z.array(
    z.object({
      artwork: z.object({
        id: z.string(),
        title: z.string(),
        creationYear: z.string().nullable(),
        status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
      }),
      role: z.string().nullable(),
    })
  ),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Artist = z.infer<typeof ArtistSchema>;
export type CreateArtist = z.infer<typeof CreateArtistSchema>;
export type UpdateArtist = z.infer<typeof UpdateArtistSchema>;
export type ArtistFilters = z.infer<typeof ArtistFiltersSchema>;
export type ArtistForm = z.infer<typeof ArtistFormSchema>;
export type ArtistWithArtworks = z.infer<typeof ArtistWithArtworksSchema>;
