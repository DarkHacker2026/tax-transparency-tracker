import { calculateTax, getSectorBreakdown } from './taxConstants';

describe('taxConstants', () => {
  test('calculates new and old regime tax with cess', () => {
    expect(calculateTax(700000, 'new')).toBe(0);
    expect(calculateTax(1000000, 'new')).toBe(52000);
    expect(calculateTax(1000000, 'old')).toBe(117000);
  });

  test('builds sector breakdown from total tax', () => {
    const sectors = getSectorBreakdown(100000);

    expect(sectors).toHaveLength(8);
    expect(sectors.find((s) => s.id === 'admin').amount).toBe(22000);
    expect(sectors.find((s) => s.id === 'healthcare').amount).toBe(5500);
  });
});
