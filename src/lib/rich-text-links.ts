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
