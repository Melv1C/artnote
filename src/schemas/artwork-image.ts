import { z } from '@/lib/zod';
import { IdSchema } from './common';
import { ImageSchema } from './image';

const ImageAttachmentFields = {
  sortOrder: z.number().int().min(0).max(1000),
  isMain: z.boolean(),
  legend: z.string().max(2_000).nullable(),
  source: z.string().max(2_000).nullable(),
};

/** An image attached to a notice, with its position and legend, as read from the database. */
export const ArtworkImageSchema = z.object({
  id: z.string().optional(),
  imageId: z.string(),
  ...ImageAttachmentFields,
  image: ImageSchema,
});

/**
 * An image attachment as the notice editor submits it: the uploaded image's id plus its
 * position and legend. The nested `image` the editor shows is dropped on parse.
 */
export const ArtworkImageInputSchema = z.object({
  imageId: IdSchema,
  ...ImageAttachmentFields,
});

export type ArtworkImage = z.infer<typeof ArtworkImageSchema>;
