import { describe, expect, it } from 'vite-plus/test';
import { isMeasuredPath, noticeReadingEvent, readingTimeBracket } from './umami';

describe('isMeasuredPath', () => {
  it.each(['/', '/artworks', '/artworks/abc123', '/about', '/confidentialite', '/whats-new'])(
    '%s is measured',
    path => {
      expect(isMeasuredPath(path)).toBe(true);
    },
  );

  it.each([
    '/dashboard',
    '/dashboard/',
    '/dashboard/artworks',
    '/Dashboard/Places',
    '/artworks/abc123/preview',
    '/artworks/abc123/preview/',
  ])('%s is not measured', path => {
    expect(isMeasuredPath(path)).toBe(false);
  });

  it('does not mistake a path that only starts like the dashboard', () => {
    expect(isMeasuredPath('/dashboards')).toBe(true);
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
