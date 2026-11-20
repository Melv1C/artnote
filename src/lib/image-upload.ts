import '@tanstack/react-start/server-only';
import { put } from '@vercel/blob';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function readImageFile(formData: FormData): File {
  const file = formData.get('file');

  if (!(file instanceof File)) {
    throw new Error('Aucun fichier fourni');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Le fichier est trop volumineux (max 10MB)');
  }

  return file;
}

export const uploadPublicImage = (pathname: string, file: File) =>
  put(pathname, file, { access: 'public', addRandomSuffix: true });
