import { formatCurrency, formatFeatureAvailability } from '../src/utils/billing-presentation';

describe('billing-presentation', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(0)).toBe('Miễn phí');
    expect(formatCurrency(150000).replace(/\s/g, '')).toContain('150.000');
  });

  it('formats feature availability correctly', () => {
    expect(formatFeatureAvailability(null, 'lượt')).toBe('Chưa khả dụng');
    expect(formatFeatureAvailability({ code: 'test', enabled: false, limit: null, consumed: 0, available: null, unlimited: false }, 'lượt')).toBe('Chưa khả dụng');
    expect(formatFeatureAvailability({ code: 'test', enabled: true, limit: null, consumed: 0, available: null, unlimited: true }, 'lượt')).toBe('Không giới hạn');
    expect(formatFeatureAvailability({ code: 'test', enabled: true, limit: 10, consumed: 2, available: 8, unlimited: false }, 'lượt')).toBe('8 lượt');
  });
});
