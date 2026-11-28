import { describe, expect, it } from 'vite-plus/test';
import { noticeSlug } from './notice-slug';

describe('noticeSlug', () => {
  it('drops accents and punctuation', () => {
    expect(noticeSlug('Église Saint-Martin')).toBe('eglise-saint-martin');
    expect(noticeSlug('Paysage avec la chute d’Icare')).toBe('paysage-avec-la-chute-d-icare');
    expect(noticeSlug("  L'Empire des lumières (1954) ! ")).toBe('l-empire-des-lumieres-1954');
  });

  it('spells out the French ligatures', () => {
    expect(noticeSlug('Œuvre et nævus')).toBe('oeuvre-et-naevus');
  });

  it('falls back to "notice" when the title has no letter or digit', () => {
    expect(noticeSlug('…')).toBe('notice');
  });
});
