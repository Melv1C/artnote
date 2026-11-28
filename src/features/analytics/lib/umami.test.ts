import { describe, expect, it } from 'vite-plus/test';
import { measuredPagePath, noticeReadingEvent, readingTimeBracket } from './umami';

describe('measuredPagePath', () => {
  const page = (path: string, resolvedPath: string | undefined, measured?: boolean) => ({
    location: { pathname: path },
    resolvedLocation: resolvedPath === undefined ? undefined : { pathname: resolvedPath },
    matches: [{ staticData: {} }, { staticData: { measured } }],
  });

  it('is the path of a loaded page', () => {
    expect(measuredPagePath(page('/artworks/abc123', '/artworks/abc123'))).toBe('/artworks/abc123');
  });

  it('waits for the page to load: until then the matches can be the previous page’s', () => {
    expect(measuredPagePath(page('/dashboard', '/'))).toBeUndefined();
    expect(measuredPagePath(page('/', '/dashboard'))).toBeUndefined();
    expect(measuredPagePath(page('/', undefined))).toBeUndefined();
  });

  it('leaves out a page one of whose routes is not measured', () => {
    expect(measuredPagePath(page('/dashboard', '/dashboard', false))).toBeUndefined();
  });
});

describe('readingTimeBracket', () => {
  it.each([
    [0, '<30s'],
    [29_999, '<30s'],
    [30_000, '30s–2min'],
    [119_999, '30s–2min'],
    [120_000, '2–5min'],
    [299_999, '2–5min'],
    [300_000, '>5min'],
    [24 * 60 * 60 * 1000, '>5min'],
  ])('%i ms is %s', (durationMs, bracket) => {
    expect(readingTimeBracket(durationMs)).toBe(bracket);
  });
});

describe('noticeReadingEvent', () => {
  it('names the notice, its title and the reading-time bracket', () => {
    expect(noticeReadingEvent({ noticeId: 'n1', title: 'La Joconde', durationMs: 45_000 })).toEqual(
      { name: 'notice_read', data: { noticeId: 'n1', title: 'La Joconde', bracket: '30s–2min' } },
    );
  });

  it('cuts long titles', () => {
    const { data } = noticeReadingEvent({ noticeId: 'n1', title: 'x'.repeat(300), durationMs: 0 });
    expect(data.title).toHaveLength(100);
  });
});
