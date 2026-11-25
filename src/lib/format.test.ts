import { describe, expect, it } from 'vite-plus/test';
import { formatDuration, plural } from './format';

describe('formatDuration', () => {
  it('counts in the largest whole unit', () => {
    expect(formatDuration(30 * 1000)).toBe('30 secondes');
    expect(formatDuration(60 * 1000)).toBe('1 minute');
    expect(formatDuration(90 * 1000)).toBe('90 secondes');
    expect(formatDuration(30 * 60 * 1000)).toBe('30 minutes');
    expect(formatDuration(24 * 60 * 60 * 1000)).toBe('24 heures');
  });
});

describe('plural', () => {
  it('keeps zero and one singular, as French does', () => {
    expect(plural(0, 'notice')).toBe('0 notice');
    expect(plural(1, 'notice')).toBe('1 notice');
    expect(plural(2, 'notice')).toBe('2 notices');
  });

  it('takes an irregular plural', () => {
    expect(plural(3, 'compte sélectionné', 'comptes sélectionnés')).toBe('3 comptes sélectionnés');
  });
});
