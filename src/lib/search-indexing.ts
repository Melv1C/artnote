// Only production is indexed: everywhere else (staging, previews, the dev server) tells crawlers
// to stay away, so copies of the notices never compete with production in search results.

/** The `X-Robots-Tag` header every response carries, or null where indexing is allowed. */
export const robotsTag = (indexingAllowed: boolean) =>
  indexingAllowed ? null : 'noindex, nofollow';

/** The body of `/robots.txt`; where indexing is allowed, it points crawlers to the sitemap. */
export const robotsTxt = (indexingAllowed: boolean, siteUrl: string) =>
  indexingAllowed
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', siteUrl)}\n`
    : 'User-agent: *\nDisallow: /\n';
