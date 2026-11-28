import { z } from '@/lib/zod';

export const ImageSchema = z.object({
  id: z.string(),
  url: z.url(),
  alt: z.string().nullable(),
  caption: z.string().nullable(),
  width: z.number().positive().nullable(),
  height: z.number().positive().nullable(),
  size: z.number().positive().nullable(),
  mimeType: z.string().nullable(),
});

export type Image = z.infer<typeof ImageSchema>;

// Upload limits, read by the server that checks an upload and by the editor that offers it

export const MAX_IMAGE_MEGABYTES = 10;
export const MAX_IMAGE_BYTES = MAX_IMAGE_MEGABYTES * 1024 * 1024;

/** The images one notice may carry. */
export const MAX_IMAGES_PER_NOTICE = 10;

/**
 * The formats an upload accepts, by MIME type: their name for writers and their file extensions,
 * the first one given to the stored file. Raster formats only: SVG can carry scripts and is
 * served from a public origin.
 */
export const IMAGE_FORMATS: Record<string, { name: string; extensions: string[] }> = {
  'image/jpeg': { name: 'JPEG', extensions: ['.jpg', '.jpeg'] },
  'image/png': { name: 'PNG', extensions: ['.png'] },
  'image/webp': { name: 'WebP', extensions: ['.webp'] },
  'image/avif': { name: 'AVIF', extensions: ['.avif'] },
  'image/gif': { name: 'GIF', extensions: ['.gif'] },
};

const formatNames = Object.values(IMAGE_FORMATS).map(format => format.name);

/** "JPEG, PNG, WebP, AVIF ou GIF". */
export const IMAGE_FORMAT_NAMES = `${formatNames.slice(0, -1).join(', ')} ou ${formatNames.at(-1)}`;
