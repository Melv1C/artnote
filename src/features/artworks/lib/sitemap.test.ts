import { describe, expect, it } from 'vite-plus/test';
import { sitemapXml } from './sitemap';

describe('sitemapXml', () => {
  const xml = sitemapXml('https://artnote.melvyn.be', [
    {
      id: 'n1',
      title: 'Paysage avec la chute d’Icare',
      updatedAt: new Date('2026-03-04T10:00:00Z'),
    },
  ]);

  it('lists the public pages', () => {
    for (const path of ['/', '/artworks', '/carte', '/about', '/confidentialite']) {
      expect(xml).toContain(`<url><loc>https://artnote.melvyn.be${path}</loc></url>`);
    }
  });

  it('lists each notice at its public URL with when it last changed', () => {
    expect(xml).toContain(
      '<url><loc>https://artnote.melvyn.be/artworks/n1/paysage-avec-la-chute-d-icare</loc><lastmod>2026-03-04T10:00:00.000Z</lastmod></url>',
    );
  });

  it('is a sitemaps.org url set', () => {
    expect(xml).toMatch(
      /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/,
    );
    expect(xml).toMatch(/<\/urlset>\n$/);
  });
});
