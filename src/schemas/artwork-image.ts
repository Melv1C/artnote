import z from "zod";
import { ImageSchema } from "./image";

export const ArtworkImageSchema = z.object({
  id: z.string(),
  artworkId: z.string(),
  imageId: z.string(),
  sortOrder: z.number().int().min(0),
  isMain: z.boolean(),
  source: z.string().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.string(),
  updatedById: z.string(),

  image: ImageSchema
});
export type ArtworkImage = z.infer<typeof ArtworkImageSchema>;

export const ArtworkImageSchemaSimplified = ArtworkImageSchema.pick({
  id: true,
  imageId: true,
  sortOrder: true,
  isMain: true,
  source: true,
  image: true,
}).extend({
  id: z.string().optional(),
});
export type ArtworkImageSimplified = z.infer<typeof ArtworkImageSchemaSimplified>;
