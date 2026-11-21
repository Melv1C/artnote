import '@tanstack/react-start/server-only';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { env } from '@/lib/env';
import { z } from '@/lib/zod';

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
    .refine(file => file.size > 0, { message: 'Le fichier est vide' })
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

const { storage } = env;

// MinIO serves buckets by path (`<endpoint>/<bucket>/<key>`), not as subdomains
const s3 =
  storage &&
  new S3Client({
    endpoint: storage.endpoint,
    region: 'us-east-1',
    forcePathStyle: true,
    credentials: { accessKeyId: storage.accessKeyId, secretAccessKey: storage.secretAccessKey },
  });

/**
 * Upload to the object storage (MinIO) as `<folder>/<random>.<ext>`; the client's file name is
 * not used. The bucket is publicly readable, so the returned URL is a plain link.
 */
export async function uploadPublicImage(folder: 'artworks' | 'avatars', file: File) {
  if (!storage || !s3) throw new Error("Le stockage des images n'est pas configuré");
  const key = `${folder}/${randomUUID()}.${EXTENSIONS[file.type] ?? 'img'}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: storage.bucket,
      Key: key,
      Body: new Uint8Array(await file.arrayBuffer()),
      ContentType: file.type,
      // Keys are random and never rewritten
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
  return { url: `${storage.publicUrl}/${key}` };
}
