const LINK = /<a\b([^>]*)>([^<]*)<\/a>/g;
const HREF = /\bhref="([^"]*)"/;
const ADDRESS = /^\s*https?:\/\//i;

/**
 * A link whose text is a raw address shows only the site it points to: a long address would
 * otherwise run past a phone's screen. The link still opens the full address, and a link whose
 * words the writer chose keeps them.
 */
export function shortenAddressLinks(html: string): string {
  return html.replace(LINK, (link, attributes: string, text: string) => {
    const href = HREF.exec(attributes)?.[1];
    if (!href || !ADDRESS.test(text) || !URL.canParse(href.replaceAll('&amp;', '&'))) return link;
    const site = new URL(href.replaceAll('&amp;', '&')).hostname.replace(/^www\./, '');
    return `<a${attributes}>${site}</a>`;
  });
}

const SCHEME = /^([a-z][a-z0-9+.-]*):/i;
const SAFE_SCHEMES = new Set(['http', 'https', 'mailto']);

/**
 * The address a writer typed for a link, ready for its `href`: one typed without its protocol
 * (`kikirpa.be`) opens over https, and only web and mail addresses are kept, so a link can never
 * run code. Null when there is nothing to link to.
 */
export function linkHref(typed: string): string | null {
  const address = typed.trim();
  if (!address) return null;
  const scheme = SCHEME.exec(address)?.[1];
  if (!scheme) return `https://${address}`;
  return SAFE_SCHEMES.has(scheme.toLowerCase()) ? address : null;
}
