import { z } from '@/lib/zod';
import {
  ArtworkStatusSchema,
  IdSchema,
  PaginationSchema,
  SearchTextSchema,
  UserRefSchema,
} from './common';

export const ArtistSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  birthDate: z.string().nullable(),
  deathDate: z.string().nullable(),
  biography: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.string(),
  updatedById: z.string(),
});

/** An artist as public pages show it: no audit columns. */
export const PublicArtistSchema = ArtistSchema.omit({ createdById: true, updatedById: true });

/** An artist with who created and last edited it, and the notices it appears in (dashboard). */
export const ArtistWithRelationsSchema = ArtistSchema.extend({
  createdBy: UserRefSchema,
  updatedBy: UserRefSchema,
  artworks: z.array(
    z.object({
      id: z.string(),
      role: z.string().nullable(),
      artwork: z.object({ id: z.string(), title: z.string(), status: ArtworkStatusSchema }),
    }),
  ),
});

export const ArtistFiltersSchema = PaginationSchema.extend({
  search: SearchTextSchema.optional(),
  name: SearchTextSchema.optional(),
});

/** A birth or death date as the sources give it: "1950", "01/01/1950", "vers 1525", "XIXe siècle". */
const artistDate = z.string().trim().max(100);

/** What the artist form submits. Empty strings mean "not set". */
export const ArtistFormSchema = z.object({
  firstName: z.string().trim().min(1, 'Le prénom est requis').max(100, 'Le prénom est trop long'),
  lastName: z.string().trim().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  birthDate: artistDate.optional(),
  deathDate: artistDate.optional(),
  biography: z.string().max(100_000).optional(),
});

export const UpdateArtistSchema = ArtistFormSchema.extend({ id: IdSchema });

export type Artist = z.infer<typeof ArtistSchema>;
export type ArtistWithRelations = z.infer<typeof ArtistWithRelationsSchema>;
export type ArtistFilters = z.input<typeof ArtistFiltersSchema>;
export type ArtistForm = z.infer<typeof ArtistFormSchema>;
