import '@tanstack/react-start/server-only';
import { put } from '@vercel/blob';
import { z } from 'zod';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

// Raster formats only: SVG can carry scripts and is served from a public origin
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];

const optionalText = z
  .string()
  .max(500)
  .nullish()
  .transform(value => value?.trim() || null);

const ImageUploadSchema = z.object({
  file: z
    .instanceof(File, { message: 'Aucun fichier fourni' })
    .refine(file => ALLOWED_IMAGE_TYPES.includes(file.type), {
      message: 'Formats acceptés : JPEG, PNG, WebP, AVIF ou GIF',
    })
    .refine(file => file.size <= MAX_IMAGE_BYTES, {
      message: 'Le fichier est trop volumineux (max 10 Mo)',
    }),
  alt: optionalText,
  caption: optionalText,
});

/** Read and validate the `file`, `alt` and `caption` fields of an upload form. */
export function readImageUpload(formData: FormData) {
  const result = ImageUploadSchema.safeParse({
    file: formData.get('file'),
    alt: formData.get('alt'),
    caption: formData.get('caption'),
  });
  if (!result.success) throw new Error(result.error.issues[0]?.message ?? 'Image invalide');
  return result.data;
}

/** Upload to Vercel Blob under `pathname` (sanitised, with a random suffix). */
export const uploadPublicImage = (pathname: string, file: File) =>
  put(pathname.replace(/[^a-zA-Z0-9./-]/g, '_'), file, {
    access: 'public',
    addRandomSuffix: true,
  });
