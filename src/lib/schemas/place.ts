import { z } from 'zod';
import { PaginationSchema, PlaceTypeSchema, SearchSchema } from './common';

// =============================================================================
// BASE SCHEMA
// =============================================================================

export const PlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: PlaceTypeSchema,
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
});

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

export const CreatePlaceSchema = PlaceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
});

export const UpdatePlaceSchema = CreatePlaceSchema.partial();

// =============================================================================
// QUERY/FILTER SCHEMAS
// =============================================================================

export const PlaceFiltersSchema = z
  .object({
    type: PlaceTypeSchema.optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  })
  .merge(SearchSchema)
  .merge(PaginationSchema);

// =============================================================================
// FORM SCHEMAS
// =============================================================================

export const PlaceFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255, 'Le nom est trop long'),
  type: PlaceTypeSchema,
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  description: z.string().optional(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Place = z.infer<typeof PlaceSchema>;
export type CreatePlace = z.infer<typeof CreatePlaceSchema>;
export type UpdatePlace = z.infer<typeof UpdatePlaceSchema>;
export type PlaceFilters = z.infer<typeof PlaceFiltersSchema>;
export type PlaceForm = z.infer<typeof PlaceFormSchema>;
