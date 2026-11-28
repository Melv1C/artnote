import { noticeParams } from './notice-slug';

// Every public page; the dashboard, previews and profile stay out.
const PUBLIC_PAGES = ['/', '/artworks', '/carte', '/about', '/confidentialite'];

type SitemapNotice = { id: string; title: string; updatedAt: Date };

/** The `/sitemap.xml` body: the public pages, then each published notice with when it last changed. */
export function sitemapXml(siteUrl: string, notices: SitemapNotice[]): string {
  const url = (path: string) => new URL(path, siteUrl).toString();
  const urls = [
    ...PUBLIC_PAGES.map(path => `<url><loc>${url(path)}</loc></url>`),
    ...notices.map(notice => {
      const { artworkId, slug } = noticeParams(notice);
      return `<url><loc>${url(`/artworks/${artworkId}/${slug}`)}</loc><lastmod>${notice.updatedAt.toISOString()}</lastmod></url>`;
    }),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}
