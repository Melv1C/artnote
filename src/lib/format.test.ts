import { describe, expect, it } from 'vite-plus/test';
import { plural } from './format';

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
