import { normalizeRadians } from '../MathUtils';

describe('MathUtils', () => {
  test('normalizeRadians', () => {
    expect(normalizeRadians(Math.PI)).toBeCloseTo(Math.PI);
    expect(normalizeRadians(-Math.PI)).toBeCloseTo(-Math.PI);
    expect(normalizeRadians(0.0)).toBeCloseTo(0.0);
    expect(normalizeRadians(2 * Math.PI)).toBeCloseTo(0.0);
    expect(normalizeRadians(Math.PI + 0.5)).toBeCloseTo(-Math.PI + 0.5);
    expect(normalizeRadians(-Math.PI - 0.5)).toBeCloseTo(Math.PI - 0.5);
  });
});
