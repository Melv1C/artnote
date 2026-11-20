import { z } from 'zod';
import { ImageSchema } from './image';

/** An image attached to a notice, with its position and legend. */
export const ArtworkImageSchema = z.object({
  id: z.string().optional(),
  imageId: z.string(),
  sortOrder: z.number().int().min(0),
  isMain: z.boolean(),
  legend: z.string().max(2_000).nullable(),
  source: z.string().max(2_000).nullable(),
  image: ImageSchema,
});

export type ArtworkImage = z.infer<typeof ArtworkImageSchema>;
