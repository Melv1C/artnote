import { z } from 'zod';
import { ArtworkStatusSchema, PaginationSchema, SearchSchema } from './common';

// =============================================================================
// BASE SCHEMA
// =============================================================================

export const ArtworkSchema = z.object({
  id: z.string(),
  title: z.string(),
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
// QUERY/FILTER SCHEMAS
// =============================================================================

export const ArtworkFiltersSchema = z
  .object({
    status: ArtworkStatusSchema.optional(),
    writerId: z.string().optional(),
    placeId: z.string().optional(),
    createdAfter: z.string().datetime().optional(),
    createdBefore: z.string().datetime().optional(),
  })
  .merge(SearchSchema)
  .merge(PaginationSchema);

// =============================================================================
// FORM SCHEMAS
// =============================================================================

export const ArtworkFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(255, 'Le titre est trop long'),
  creationYear: z.string().optional(),
  medium: z.string().optional(),
  dimensions: z.string().optional(),
  notice: z.string().optional(),
  sources: z.string().optional(),
  status: ArtworkStatusSchema.default('DRAFT'),
  placeId: z.string().optional(),
  artistIds: z.array(z.string()).optional(),
  imageIds: z.array(z.string()).optional(),
});

// =============================================================================
// EXTENDED SCHEMAS
// =============================================================================

export const ArtworkWithRelationsSchema = ArtworkSchema.extend({
  writer: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
  }),
  place: z
    .object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['MUSEUM', 'CHURCH', 'PUBLIC_SPACE', 'OTHER']),
      address: z.string().nullable(),
      city: z.string().nullable(),
      country: z.string().nullable(),
      latitude: z.number().nullable(),
      longitude: z.number().nullable(),
      website: z.string().url().nullable().or(z.literal('')),
      description: z.string().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
      createdById: z.string(),
      updatedById: z.string(),
    })
    .nullable(),
  artists: z.array(
    z.object({
      artist: z.object({
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
      }),
      role: z.string().nullable(),
    })
  ),
  images: z.array(
    z.object({
      image: z.object({
        id: z.string(),
        url: z.string().url(),
        alt: z.string().nullable(),
        caption: z.string().nullable(),
        width: z.number().positive().nullable(),
        height: z.number().positive().nullable(),
        size: z.number().positive().nullable(),
        mimeType: z.string().nullable(),
        isMain: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date(),
        createdById: z.string(),
        updatedById: z.string(),
      }),
      sortOrder: z.number(),
    })
  ),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Artwork = z.infer<typeof ArtworkSchema>;
export type CreateArtwork = z.infer<typeof CreateArtworkSchema>;
export type UpdateArtwork = z.infer<typeof UpdateArtworkSchema>;
export type ArtworkFilters = z.infer<typeof ArtworkFiltersSchema>;
export type ArtworkForm = z.infer<typeof ArtworkFormSchema>;
export type ArtworkWithRelations = z.infer<typeof ArtworkWithRelationsSchema>;
