import { describe, expect, it } from 'vite-plus/test';
import { robotsTag, robotsTxt } from './search-indexing';

describe('search indexing', () => {
  it('keeps an environment out of search engines unless indexing is allowed', () => {
    expect(robotsTag(false)).toBe('noindex, nofollow');
    expect(robotsTxt(false, 'https://stg.artnote.melvyn.be')).toBe('User-agent: *\nDisallow: /\n');
  });

  it('lets crawlers index production', () => {
    expect(robotsTag(true)).toBeNull();
    expect(robotsTxt(true, 'https://artnote.melvyn.be')).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://artnote.melvyn.be/sitemap.xml\n',
    );
  });
});
