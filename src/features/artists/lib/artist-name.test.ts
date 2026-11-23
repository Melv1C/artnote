import { describe, expect, it } from 'vite-plus/test';
import { artistFullName } from './artist-name';

describe('artistFullName', () => {
  it('joins the first and last name', () => {
    expect(artistFullName({ firstName: 'René', lastName: 'Magritte' })).toBe('René Magritte');
  });

  it('is the first name alone for an artist known by a single name', () => {
    expect(artistFullName({ firstName: 'Giotto', lastName: '' })).toBe('Giotto');
  });
});
