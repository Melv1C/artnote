import { describe, expect, it } from 'vite-plus/test';
// Loaded alone on purpose: a schema module must get French messages without other imports
import { ImageSchema } from '@/schemas/image';

describe('@/lib/zod', () => {
  it('gives every schema French default messages', () => {
    const result = ImageSchema.shape.url.safeParse('not a url');
    expect(result.error?.issues[0]?.message).toMatch(/invalide/i);
  });
});
