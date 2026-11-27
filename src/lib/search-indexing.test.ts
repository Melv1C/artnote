import { describe, expect, it } from 'vite-plus/test';
import { robotsTag, robotsTxt } from './search-indexing';

describe('search indexing', () => {
  it('keeps an environment out of search engines unless indexing is allowed', () => {
    expect(robotsTag(false)).toBe('noindex, nofollow');
    expect(robotsTxt(false)).toBe('User-agent: *\nDisallow: /\n');
  });

  it('lets crawlers index production', () => {
    expect(robotsTag(true)).toBeNull();
    expect(robotsTxt(true)).toBe('User-agent: *\nAllow: /\n');
  });
});
