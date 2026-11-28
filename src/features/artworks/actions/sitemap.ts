import '@tanstack/react-start/server-only';
import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { publishedWhere } from '../lib/artwork-status';
import { sitemapXml } from '../lib/sitemap';

/** The `/sitemap.xml` body, listing every published notice. */
export async function buildSitemap(): Promise<string> {
  const notices = await prisma.artwork.findMany({
    where: publishedWhere,
    select: { id: true, title: true, updatedAt: true },
  });
  return sitemapXml(env.BASE_URL, notices);
}
