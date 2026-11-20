import { dashboardAccessMiddleware } from '@/lib/auth-functions';
import { readImageUpload, uploadPublicImage } from '@/lib/image-upload';
import { prisma } from '@/lib/prisma';
import { ArtworkFormSchema, type ArtworkForm } from '@/schemas/artwork';
import { ArtworkStatusSchema, emptyToNull, IdSchema } from '@/schemas/common';
import { ImageSchema } from '@/schemas/image';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { nextPublishedAt, ownedBy } from '../lib/artwork-status';
import { recordArtworkView } from './artwork-views';

/**
 * Load a notice for a mutation. Writers only change their own notices: another writer's notice
 * is reported as not found, like a missing one.
 */
async function findOwnArtwork(artworkId: string, userId: string) {
  const artwork = await prisma.artwork.findFirst({
    where: ownedBy(userId, artworkId),
    select: { id: true, publishedAt: true },
  });
  if (!artwork) throw notFound();
  return artwork;
}

const toArtworkFields = (form: ArtworkForm) => ({
  title: form.title,
  creationYear: emptyToNull(form.creationYear),
  medium: emptyToNull(form.medium),
  dimensions: emptyToNull(form.dimensions),
  notice: emptyToNull(form.notice),
  sources: emptyToNull(form.sources),
  status: form.status,
  placeId: form.placeId,
});

const toImageRows = (artworkId: string, userId: string, form: ArtworkForm) =>
  form.images.map(image => ({
    artworkId,
    imageId: image.imageId,
    sortOrder: image.sortOrder,
    isMain: image.isMain,
    legend: image.legend,
    source: image.source,
    createdById: userId,
    updatedById: userId,
  }));

const toArtistRows = (artworkId: string, form: ArtworkForm) =>
  form.artistIds.map(artistId => ({ artworkId, artistId, role: null }));

export const createArtwork = createServerFn({ method: 'POST' })
  .middleware([dashboardAccessMiddleware])
  .validator(ArtworkFormSchema)
  .handler(async ({ data: form, context: { user } }) => {
    await prisma.$transaction(async tx => {
      const artwork = await tx.artwork.create({
        data: {
          ...toArtworkFields(form),
          publishedAt: nextPublishedAt(form.status, null),
          writerId: user.id,
        },
      });
      await tx.artworkImage.createMany({ data: toImageRows(artwork.id, user.id, form) });
      await tx.artworkArtist.createMany({ data: toArtistRows(artwork.id, form) });
    });
  });

export const updateArtwork = createServerFn({ method: 'POST' })
  .middleware([dashboardAccessMiddleware])
  .validator(z.object({ artworkId: IdSchema, data: ArtworkFormSchema }))
  .handler(async ({ data: { artworkId, data: form }, context: { user } }) => {
    const existing = await findOwnArtwork(artworkId, user.id);

    // Images and artists are replaced as a whole
    await prisma.$transaction(async tx => {
      await tx.artwork.update({
        where: { id: artworkId },
        data: {
          ...toArtworkFields(form),
          publishedAt: nextPublishedAt(form.status, existing.publishedAt),
        },
      });
      await tx.artworkImage.deleteMany({ where: { artworkId } });
      await tx.artworkImage.createMany({ data: toImageRows(artworkId, user.id, form) });
      await tx.artworkArtist.deleteMany({ where: { artworkId } });
      await tx.artworkArtist.createMany({ data: toArtistRows(artworkId, form) });
    });
  });

export const deleteArtwork = createServerFn({ method: 'POST' })
  .middleware([dashboardAccessMiddleware])
  .validator(IdSchema)
  .handler(async ({ data: artworkId, context: { user } }) => {
    await findOwnArtwork(artworkId, user.id);
    // Images, artist links and analytics rows cascade
    await prisma.artwork.delete({ where: { id: artworkId } });
  });

export const changeArtworkStatus = createServerFn({ method: 'POST' })
  .middleware([dashboardAccessMiddleware])
  .validator(z.object({ artworkId: IdSchema, status: ArtworkStatusSchema }))
  .handler(async ({ data: { artworkId, status }, context: { user } }) => {
    const existing = await findOwnArtwork(artworkId, user.id);
    await prisma.artwork.update({
      where: { id: artworkId },
      data: { status, publishedAt: nextPublishedAt(status, existing.publishedAt) },
    });
  });

const ImageUploadSchema = z.instanceof(FormData);

/** Upload an image to Vercel Blob and record it. Attach it to a notice through `updateArtwork`. */
export const uploadArtworkImage = createServerFn({ method: 'POST' })
  .middleware([dashboardAccessMiddleware])
  .validator(ImageUploadSchema)
  .handler(async ({ data: formData }) => {
    const { file, alt, caption } = readImageUpload(formData);
    const blob = await uploadPublicImage('artworks', file);
    const image = await prisma.image.create({
      data: { url: blob.url, alt, caption, size: file.size, mimeType: file.type },
    });
    return ImageSchema.parse(image);
  });

/**
 * Count a public view of a published notice. Public, called once by the notice page on mount
 * (not from its loader, which the router also runs to preload on hover).
 */
export const recordNoticeView = createServerFn({ method: 'POST' })
  .validator(IdSchema)
  .handler(async ({ data: artworkId }) => {
    await recordArtworkView({
      artworkId,
      forwardedFor: getRequestHeader('x-forwarded-for') ?? getRequestHeader('x-real-ip'),
    });
  });
