/** Up to two capital initials of a person's name, for an avatar without a picture. */
export function initials(name: string | null | undefined): string {
  const letters = (name ?? '')
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean)
    .map(word => word[0]);
  if (letters.length === 0) return '?';
  const picked = letters.length > 2 ? [letters[0], letters[letters.length - 1]] : letters;
  return picked.join('').toUpperCase();
}
