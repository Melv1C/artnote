import { createServerFn } from '@tanstack/react-start';
import { env } from './env';

export const SITE_NAME = 'ArtNote';
export const SITE_TITLE = 'ArtNote - La peinture dans tout son art';
export const SITE_DESCRIPTION =
  "(Re)découvrez l'histoire de la peinture à travers des notices scientifiques. Visitez les musées belges autrement grâce à cette plateforme accessible et didactique.";

export const DEFAULT_OG_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: SITE_TITLE,
};

/** Origin used to resolve absolute Open Graph URLs. Loaded once by the root route. */
export const getSiteUrl = createServerFn({ method: 'GET' }).handler(() => env.SITE_URL);

const absoluteUrl = (siteUrl: string, path: string) => new URL(path, siteUrl).toString();

type OgImage = { url: string; width?: number; height?: number; alt?: string };

export const ogImageMeta = (siteUrl: string, images: OgImage[]) =>
  images.flatMap(image => [
    { property: 'og:image', content: absoluteUrl(siteUrl, image.url) },
    ...(image.width ? [{ property: 'og:image:width', content: String(image.width) }] : []),
    ...(image.height ? [{ property: 'og:image:height', content: String(image.height) }] : []),
    ...(image.alt ? [{ property: 'og:image:alt', content: image.alt }] : []),
  ]);

/**
 * Title and description tags for a page.
 */
export const pageMeta = (title: string, description: string) => [
  { title },
  { name: 'description', content: description },
];
