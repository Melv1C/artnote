const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

/**
 * An artist's biography as the rich text editor opens it. Biographies were once typed in a plain
 * text field: each of their lines becomes a paragraph, which the editor would otherwise run
 * together. One saved from the editor is HTML already, and always starts with a tag.
 */
export function biographyHtml(biography: string | null): string {
  if (!biography || /^\s*</.test(biography)) return biography ?? '';
  return biography
    .split(/\r?\n/)
    .filter(line => line.trim())
    .map(line => `<p>${line.replace(/[&<>]/g, char => ESCAPES[char])}</p>`)
    .join('');
}
