import type { ArtworkEditorValues } from '@/schemas/artwork';
import type { Image } from '@/schemas/image';

/** An image attachment as the notice editor holds it. */
export type EditorAttachment = ArtworkEditorValues['images'][number];

/**
 * The attachments with `sortOrder` following their position and exactly one main image when
 * there is any: the first one marked main, else the first one.
 */
function normalize(attachments: EditorAttachment[]): EditorAttachment[] {
  const mainIndex = Math.max(
    0,
    attachments.findIndex(attachment => attachment.isMain),
  );
  return attachments.map((attachment, index) => ({
    ...attachment,
    sortOrder: index,
    isMain: index === mainIndex,
  }));
}

/** Attach uploaded images after the current ones, without legend or source. */
export const attachImages = (attachments: EditorAttachment[], images: Image[]) =>
  normalize([
    ...attachments,
    ...images.map(image => ({
      imageId: image.id,
      image,
      sortOrder: 0,
      isMain: false,
      legend: null,
      source: null,
    })),
  ]);

export function moveAttachment(attachments: EditorAttachment[], from: number, to: number) {
  const moved = attachments[from];
  if (!moved) return attachments;
  const rest = attachments.toSpliced(from, 1);
  return normalize(rest.toSpliced(to, 0, moved));
}

/** Detach an image. When it was the main one, the first image left takes over. */
export const detachImage = (attachments: EditorAttachment[], imageId: string) =>
  normalize(attachments.filter(attachment => attachment.imageId !== imageId));

export const setMainImage = (attachments: EditorAttachment[], imageId: string) =>
  normalize(
    attachments.map(attachment => ({ ...attachment, isMain: attachment.imageId === imageId })),
  );

/** Change an attachment's legend or source; an empty text means none. */
export const editAttachment = (
  attachments: EditorAttachment[],
  imageId: string,
  field: 'legend' | 'source',
  text: string | null,
) =>
  attachments.map(attachment =>
    attachment.imageId === imageId ? { ...attachment, [field]: text || null } : attachment,
  );
