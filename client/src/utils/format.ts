const compactCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 2,
});

const regularCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const highPrecisionCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 8,
});

export function formatCurrency(value?: number | null, compact = false) {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  if (compact) return compactCurrency.format(value);
  return Math.abs(value) < 1 ? highPrecisionCurrency.format(value) : regularCurrency.format(value);
}

export function formatNumber(value?: number | null, compact = true) {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value?: number | null) {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
