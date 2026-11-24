import { describe, expect, it } from 'vite-plus/test';
import { formatCoordinate, parsePosition } from './place-position';

describe('parsePosition', () => {
  it('reads a position from the two form fields', () => {
    expect(parsePosition('50.8467', '4.3525')).toEqual({ latitude: 50.8467, longitude: 4.3525 });
  });

  it('accepts negative and zero coordinates', () => {
    expect(parsePosition('0', '-73.5')).toEqual({ latitude: 0, longitude: -73.5 });
  });

  it('has no position while a field is empty or blank', () => {
    expect(parsePosition('', '4.3525')).toBeNull();
    expect(parsePosition('50.8467', '  ')).toBeNull();
  });

  it('has no position while a field is not a number', () => {
    expect(parsePosition('50,8', '4.3525')).toBeNull();
    expect(parsePosition('-', '4.3525')).toBeNull();
  });

  it('has no position outside the ranges the form accepts', () => {
    expect(parsePosition('91', '4')).toBeNull();
    expect(parsePosition('50', '-180.5')).toBeNull();
  });
});

describe('formatCoordinate', () => {
  it('keeps six decimals, about ten centimetres', () => {
    expect(formatCoordinate(50.846712345)).toBe('50.846712');
  });

  it('drops trailing zeros', () => {
    expect(formatCoordinate(4.35)).toBe('4.35');
    expect(formatCoordinate(-3)).toBe('-3');
  });
});
