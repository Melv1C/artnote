import { z } from '@/lib/zod';
import { ImageSchema } from './image';
import {
  WebLinkSchema,
  IdSchema,
  PaginationSchema,
  PlaceTypeSchema,
  SearchTextSchema,
} from './common';

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

/** A place as public pages show it: no audit columns. */
export const PublicPlaceSchema = PlaceSchema.omit({ createdById: true, updatedById: true });

/** A published notice in a place's details on the map: its title and main image. */
const MapNoticeSchema = z.object({
  id: z.string(),
  title: z.string(),
  image: ImageSchema.nullable(),
});

/**
 * A place on the public map: its public fields, a position, its number of published notices and
 * the first of them, newest first.
 */
export const MapPlaceSchema = PublicPlaceSchema.extend({
  latitude: z.number(),
  longitude: z.number(),
  noticeCount: z.number().int().positive(),
  notices: MapNoticeSchema.array(),
});

/** A place with the notices located there (dashboard). */
export const PlaceWithRelationsSchema = PlaceSchema.extend({
  artworks: z.array(z.object({ id: z.string(), title: z.string() })),
});

export const PlaceFiltersSchema = PaginationSchema.extend({
  search: SearchTextSchema.optional(),
  type: PlaceTypeSchema.optional(),
  city: SearchTextSchema.optional(),
  country: SearchTextSchema.optional(),
  /** Only places that lack a latitude or a longitude. */
  missingPosition: z.boolean().optional(),
});

/** The largest latitude and longitude, either side of zero. */
export const COORDINATE_LIMITS = { latitude: 90, longitude: 180 } as const;

const coordinate = (name: keyof typeof COORDINATE_LIMITS) =>
  z
    .number({
      error: issue =>
        issue.input === undefined ? `Position manquante : indiquez la ${name}` : undefined,
    })
    .min(-COORDINATE_LIMITS[name])
    .max(COORDINATE_LIMITS[name]);

// Form inputs send strings; empty means "not set", which the position refuses
const requiredCoordinate = (name: keyof typeof COORDINATE_LIMITS) =>
  z.preprocess(value => {
    if (value === '' || value === null) return undefined;
    return typeof value === 'string' ? Number(value) : value;
  }, coordinate(name));

/** What the place form submits. */
export const PlaceFormSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(255, 'Le nom est trop long'),
  // The default message lists the enum's codes, which a writer never sees
  type: z.enum(PlaceTypeSchema.options, 'Le type est requis'),
  address: z.string().max(500).optional(),
  city: z.string().max(255).optional(),
  country: z.string().max(255).optional(),
  latitude: requiredCoordinate('latitude'),
  longitude: requiredCoordinate('longitude'),
  website: z.union([z.literal(''), WebLinkSchema]).optional(),
  description: z.string().max(100_000).optional(),
});

export const UpdatePlaceSchema = PlaceFormSchema.extend({ id: IdSchema });

/** What the place form's address search sends: an address or a place name. */
export const AddressSearchSchema = z.object({
  query: SearchTextSchema.min(1, 'Saisissez une adresse ou un nom de lieu'),
});

/** One address search result: its full label, its position and what it knows of its address. */
export const AddressResultSchema = z.object({
  label: z.string(),
  latitude: coordinate('latitude'),
  longitude: coordinate('longitude'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export type Place = z.infer<typeof PlaceSchema>;
export type MapPlace = z.infer<typeof MapPlaceSchema>;
export type PlaceWithRelations = z.infer<typeof PlaceWithRelationsSchema>;
export type PlaceFilters = z.input<typeof PlaceFiltersSchema>;
export type PlaceForm = z.infer<typeof PlaceFormSchema>;
export type AddressResult = z.infer<typeof AddressResultSchema>;
