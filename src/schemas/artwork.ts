import { z } from '@/lib/zod';
import { ArtistSchema, PublicArtistSchema } from './artist';
import { ArtworkImageInputSchema, ArtworkImageSchema } from './artwork-image';
import { ImageSchema, MAX_IMAGES_PER_NOTICE } from './image';
import { ArtworkStatusSchema, IdSchema } from './common';
import { PlaceSchema, PublicPlaceSchema } from './place';
import { AuthorSchema } from './user';

/** A notice as read from the database, with its place, artists and images. */
export const ArtworkSchema = z.object({
  id: z.string(),
  title: z.string(),
  creationYear: z.string().nullable(),
  medium: z.string().nullable(),
  dimensions: z.string().nullable(),
  notice: z.string().nullable(),
  sources: z.string().nullable(),
  status: ArtworkStatusSchema,
  publishedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  writerId: z.string(),
  placeId: z.string().nullable(),
  place: PlaceSchema.nullable(),
  viewCount: z.number().int().min(0),
  lastViewedAt: z.date().nullable(),
  images: ArtworkImageSchema.array(),
  artists: z.object({ artist: ArtistSchema, role: z.string().nullable() }).array(),
});

/**
 * A notice as public pages read it: its writer's public profile, and no internal columns
 * (writer id, view counters, audit ids of its place and artists). Parsing drops them.
 */
export const PublicArtworkSchema = ArtworkSchema.omit({
  writerId: true,
  viewCount: true,
  lastViewedAt: true,
}).extend({
  place: PublicPlaceSchema.nullable(),
  artists: z.object({ artist: PublicArtistSchema, role: z.string().nullable() }).array(),
  writer: AuthorSchema,
});

const optionalText = (max: number) => z.string().max(max).nullable();

/** What the notice editor submits for create and update. */
export const ArtworkFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Le titre doit comporter au moins 2 caractères')
    .max(255, 'Le titre ne peut pas dépasser 255 caractères'),
  creationYear: optionalText(100),
  medium: optionalText(255),
  dimensions: optionalText(255),
  notice: optionalText(500_000),
  sources: optionalText(100_000),
  status: ArtworkStatusSchema,
  placeId: IdSchema.nullable(),
  images: ArtworkImageInputSchema.array().max(MAX_IMAGES_PER_NOTICE),
  artistIds: IdSchema.array().max(50),
});

export type Artwork = z.infer<typeof ArtworkSchema>;
export type PublicArtwork = z.infer<typeof PublicArtworkSchema>;
export type ArtworkForm = z.infer<typeof ArtworkFormSchema>;

/**
 * The notice editor's state: the form, with each attached image's details for previews, and the
 * chosen artists and place themselves rather than their ids. `toArtworkForm` turns it into the
 * submitted form; `ArtworkFormSchema` then drops the image details on the server.
 */
export const ArtworkEditorSchema = ArtworkFormSchema.omit({
  artistIds: true,
  placeId: true,
}).extend({
  images: ArtworkImageInputSchema.extend({ id: z.string().optional(), image: ImageSchema })
    .array()
    .max(MAX_IMAGES_PER_NOTICE),
  artists: ArtistSchema.pick({ id: true, firstName: true, lastName: true }).array().max(50),
  place: PlaceSchema.pick({ id: true, name: true, city: true, country: true }).nullable(),
});

export type ArtworkEditorValues = z.infer<typeof ArtworkEditorSchema>;

/** What the editor submits: its values, with the chosen artists and place as ids. */
export const toArtworkForm = ({ artists, place, ...values }: ArtworkEditorValues): ArtworkForm => ({
  ...values,
  artistIds: artists.map(artist => artist.id),
  placeId: place?.id ?? null,
});
