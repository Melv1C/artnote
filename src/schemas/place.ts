import { z } from 'zod';
import { IdSchema, PaginationSchema, PlaceTypeSchema, SearchTextSchema } from './common';

export const PlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: PlaceTypeSchema,
  address: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  website: z.string().nullable(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.string(),
  updatedById: z.string(),
});

const UserRefSchema = z.object({ id: z.string(), name: z.string() });

/** A place with who created and last edited it, and the notices located there (dashboard). */
export const PlaceWithRelationsSchema = PlaceSchema.extend({
  createdBy: UserRefSchema,
  updatedBy: UserRefSchema,
  artworks: z.array(z.object({ id: z.string(), title: z.string() })),
});

export const PlaceFiltersSchema = PaginationSchema.extend({
  search: SearchTextSchema.optional(),
  type: PlaceTypeSchema.optional(),
  city: SearchTextSchema.optional(),
  country: SearchTextSchema.optional(),
});

// Form inputs send strings; empty means "not set"
const optionalNumber = (min: number, max: number) =>
  z.preprocess(
    value => (value === '' || value === null ? undefined : value),
    z.coerce.number().min(min).max(max).optional(),
  );

/** What the place form submits. */
export const PlaceFormSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(255, 'Le nom est trop long'),
  type: PlaceTypeSchema,
  address: z.string().max(500).optional(),
  city: z.string().max(255).optional(),
  country: z.string().max(255).optional(),
  latitude: optionalNumber(-90, 90),
  longitude: optionalNumber(-180, 180),
  website: z.union([z.literal(''), z.url('URL invalide')]).optional(),
  description: z.string().max(100_000).optional(),
});

export const UpdatePlaceSchema = PlaceFormSchema.extend({ id: IdSchema });

export type Place = z.infer<typeof PlaceSchema>;
export type PlaceWithRelations = z.infer<typeof PlaceWithRelationsSchema>;
export type PlaceFilters = z.input<typeof PlaceFiltersSchema>;
export type PlaceForm = z.infer<typeof PlaceFormSchema>;
