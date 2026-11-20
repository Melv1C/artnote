import { z } from 'zod';
import { ArtistSchema } from './artist';
import { ArtworkImageSchema } from './artwork-image';
import { ArtworkStatusSchema, IdSchema } from './common';
import { PlaceSchema } from './place';
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

/** A notice with its writer's public profile, as public pages read it. */
export const PublicArtworkSchema = ArtworkSchema.extend({ writer: AuthorSchema });

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
  images: ArtworkImageSchema.array().max(50),
  artistIds: IdSchema.array().max(50),
});

export type Artwork = z.infer<typeof ArtworkSchema>;
export type PublicArtwork = z.infer<typeof PublicArtworkSchema>;
export type ArtworkForm = z.infer<typeof ArtworkFormSchema>;
