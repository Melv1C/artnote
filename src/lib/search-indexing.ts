// Only production is indexed: everywhere else (staging, previews, the dev server) tells crawlers
// to stay away, so copies of the notices never compete with production in search results.

/** The `X-Robots-Tag` header every response carries, or null where indexing is allowed. */
export const robotsTag = (indexingAllowed: boolean) =>
  indexingAllowed ? null : 'noindex, nofollow';

/** The body of `/robots.txt`. */
export const robotsTxt = (indexingAllowed: boolean) =>
  `User-agent: *\n${indexingAllowed ? 'Allow' : 'Disallow'}: /\n`;
