import '@tanstack/react-start/server-only';
import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

// Raster formats only: SVG can carry scripts and is served from a public origin
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

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

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

/** Upload to Vercel Blob as `<folder>/<random>.<ext>`; the client's file name is not used. */
export const uploadPublicImage = (folder: 'artworks' | 'avatars', file: File) =>
  put(`${folder}/${randomUUID()}.${EXTENSIONS[file.type] ?? 'img'}`, file, { access: 'public' });
