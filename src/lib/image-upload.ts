import '@tanstack/react-start/server-only';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { env } from '@/lib/env';
import { z } from '@/lib/zod';
import {
  IMAGE_FORMAT_NAMES,
  IMAGE_FORMATS,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MEGABYTES,
} from '@/schemas/image';

const ImageUploadSchema = z.object({
  file: z
    .instanceof(File, { message: 'Aucun fichier fourni' })
    .refine(file => Object.hasOwn(IMAGE_FORMATS, file.type), {
      message: `Formats acceptés : ${IMAGE_FORMAT_NAMES}`,
    })
    .refine(file => file.size > 0, { message: 'Le fichier est vide' })
    .refine(file => file.size <= MAX_IMAGE_BYTES, {
      message: `Le fichier est trop volumineux (max ${MAX_IMAGE_MEGABYTES} Mo)`,
    }),
});

export function readImageUpload(formData: FormData) {
  const result = ImageUploadSchema.safeParse({
    file: formData.get('file'),
  });
  if (!result.success) throw new Error(result.error.issues[0]?.message ?? 'Image invalide');
  return result.data;
}

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
  const extension = IMAGE_FORMATS[file.type]?.extensions[0] ?? '.img';
  const key = `${folder}/${randomUUID()}${extension}`;
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
