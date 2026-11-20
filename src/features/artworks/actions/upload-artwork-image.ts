import { createServerFn } from '@tanstack/react-start';
import { dashboardAccessMiddleware } from '@/lib/auth-functions';
import { readImageFile, uploadPublicImage } from '@/lib/image-upload';
import { prisma } from '@/lib/prisma';
import { ImageSchema } from '@/schemas/image';

export const uploadArtworkImage = createServerFn({ method: 'POST' })
  .middleware([dashboardAccessMiddleware])
  .validator((formData: FormData) => formData)
  .handler(async ({ data: formData }) => {
    const file = readImageFile(formData);
    const blob = await uploadPublicImage(
      `artworks/${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      file,
    );

    const image = await prisma.image.create({
      data: {
        url: blob.url,
        alt: (formData.get('alt') as string | null) || null,
        caption: (formData.get('caption') as string | null) || null,
        size: file.size,
        mimeType: file.type,
      },
    });

    return ImageSchema.parse(image);
  });
