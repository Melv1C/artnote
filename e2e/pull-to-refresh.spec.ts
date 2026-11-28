import { expect, test } from './fixtures';

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test('a reader in the installed app pulls the page down to reload it', async ({ page }) => {
  // What iOS sets in an app opened from the home screen
  await page.addInitScript(() => Object.defineProperty(navigator, 'standalone', { value: true }));
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeVisible();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => Object.assign(window, { beforeReload: true }));

  const reloaded = page.waitForEvent('load');
  const cdp = await page.context().newCDPSession(page);
  const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', y?: number) =>
    cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: y === undefined ? [] : [{ x: 195, y }],
    });
  await touch('touchStart', 200);
  for (let y = 220; y <= 400; y += 20) await touch('touchMove', y);
  await touch('touchEnd');

  await reloaded;
  expect(await page.evaluate(() => 'beforeReload' in window)).toBe(false);
});
