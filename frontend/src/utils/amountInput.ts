export function formatAmountValue(raw: string): string {
  const digitsAndDots = raw.replace(/[^\d.]/g, '');
  const parts = digitsAndDots.split('.');
  if (parts.length <= 1) return digitsAndDots;
  return parts[0] + '.' + parts[1];
}

export function formatAmountDisplay(value: string | number | null | undefined): string {
  if (value == null || value === '') return '';
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isNaN(n) ? String(value) : String(n);
}
