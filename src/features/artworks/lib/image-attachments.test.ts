import { describe, expect, it } from 'vite-plus/test';
import {
  attachImages,
  detachImage,
  editAttachment,
  moveAttachment,
  setMainImage,
  type EditorAttachment,
} from './image-attachments';

const image = (id: string) => ({
  id,
  url: `https://files.example/${id}.png`,
  alt: null,
  caption: null,
  width: null,
  height: null,
  size: null,
  mimeType: 'image/png',
});

const summary = (attachments: EditorAttachment[]) =>
  attachments.map(({ imageId, sortOrder, isMain }) => ({ imageId, sortOrder, isMain }));

const three = attachImages([], ['a', 'b', 'c'].map(image));

describe('image attachments', () => {
  it('makes the first uploaded image the main one and numbers them in order', () => {
    expect(summary(three)).toEqual([
      { imageId: 'a', sortOrder: 0, isMain: true },
      { imageId: 'b', sortOrder: 1, isMain: false },
      { imageId: 'c', sortOrder: 2, isMain: false },
    ]);
    expect(three[0]).toMatchObject({ legend: null, source: null, image: image('a') });
  });

  it('adds new images after the current ones, keeping the main image', () => {
    const withMain = setMainImage(three, 'b');
    expect(summary(attachImages(withMain, [image('d')]))).toEqual([
      { imageId: 'a', sortOrder: 0, isMain: false },
      { imageId: 'b', sortOrder: 1, isMain: true },
      { imageId: 'c', sortOrder: 2, isMain: false },
      { imageId: 'd', sortOrder: 3, isMain: false },
    ]);
  });

  it('moves an image and renumbers the positions', () => {
    expect(summary(moveAttachment(three, 0, 2))).toEqual([
      { imageId: 'b', sortOrder: 0, isMain: false },
      { imageId: 'c', sortOrder: 1, isMain: false },
      { imageId: 'a', sortOrder: 2, isMain: true },
    ]);
  });

  it('keeps a single main image when another image is removed', () => {
    const withMain = setMainImage(three, 'c');
    expect(summary(detachImage(withMain, 'a'))).toEqual([
      { imageId: 'b', sortOrder: 0, isMain: false },
      { imageId: 'c', sortOrder: 1, isMain: true },
    ]);
  });

  it('hands the main role to the first image left when the main one is removed', () => {
    expect(summary(detachImage(three, 'a'))).toEqual([
      { imageId: 'b', sortOrder: 0, isMain: true },
      { imageId: 'c', sortOrder: 1, isMain: false },
    ]);
    expect(detachImage(attachImages([], [image('a')]), 'a')).toEqual([]);
  });

  it('sets a legend or a source, an empty text clearing it', () => {
    const legended = editAttachment(three, 'b', 'legend', '<em>Icare</em>');
    expect(legended[1]?.legend).toBe('<em>Icare</em>');
    expect(editAttachment(legended, 'b', 'legend', '')[1]?.legend).toBeNull();
    expect(editAttachment(three, 'b', 'source', 'KIK-IRPA')[1]?.source).toBe('KIK-IRPA');
  });
});
