import { expect, notices, test } from './fixtures';

// The dev server behaves like staging and previews: only production sets ALLOW_INDEXING.
test.describe('outside production, search engines', () => {
  test('are told not to index a page', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow');
  });

  test('are disallowed everything by robots.txt', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBe(true);
    expect(await response.text()).toBe('User-agent: *\nDisallow: /\n');
  });
});

test('the sitemap lists published notices and not drafts', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.ok()).toBe(true);
  const xml = await response.text();
  expect(xml).toContain(`/artworks/${notices.icarus.id}/paysage-avec-la-chute-d-icare</loc>`);
  expect(xml).not.toContain(notices.empire.id);
});
