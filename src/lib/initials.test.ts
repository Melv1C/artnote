import { describe, expect, it } from 'vite-plus/test';
import { initials } from './initials';

describe('initials', () => {
  it('takes the first letter of each of two names', () => {
    expect(initials('Elise Poot')).toBe('EP');
  });

  it('keeps the first and last of longer names', () => {
    expect(initials('Pieter Bruegel l’Ancien')).toBe('PL');
    expect(initials('Jean-Pierre de la Tour')).toBe('JT');
  });

  it('handles one name, extra spaces and no name', () => {
    expect(initials('  admin ')).toBe('A');
    expect(initials('')).toBe('?');
    expect(initials(null)).toBe('?');
  });
});
