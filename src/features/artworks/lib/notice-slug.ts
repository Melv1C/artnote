/**
 * The words of a notice's URL, from its title: `Église Saint-Martin` → `eglise-saint-martin`.
 * The id in the URL decides which notice opens; the slug only makes the URL readable.
 */
export function noticeSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .replaceAll('œ', 'oe')
    .replaceAll('æ', 'ae')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'notice';
}

/** The route params of a notice's public page. */
export const noticeParams = ({ id, title }: { id: string; title: string }) => ({
  artworkId: id,
  slug: noticeSlug(title),
});
