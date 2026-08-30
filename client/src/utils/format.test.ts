import { describe, expect, it } from 'vitest';
import { formatCurrency, formatNumber, formatPercentage, stripHtml } from './format';

describe('financial format helpers', () => {
  it('formats currency for exact and compact market values', () => {
    expect(formatCurrency(80_000)).toContain('$80,000');
    expect(formatCurrency(1_600_000_000_000, true)).toBe('$1.6T');
    expect(formatCurrency(null)).toBe('—');
  });

  it('formats numeric and percentage values with fallbacks', () => {
    expect(formatNumber(18_617)).toBe('18.62K');
    expect(formatNumber(1_600_000, true)).toBe('1.6M');
    expect(formatPercentage(2.345)).toBe('+2.35%');
    expect(formatPercentage(-1.2)).toBe('-1.20%');
    expect(formatPercentage(undefined)).toBe('—');
  });

  it('converts API description markup into readable text', () => {
    expect(stripHtml('<p>Bitcoin &amp; markets</p>')).toBe('Bitcoin &amp; markets');
    expect(stripHtml('')).toBe('');
  });
});
