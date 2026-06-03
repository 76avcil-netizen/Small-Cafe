import type { AppCurrency } from '../store/settingsStore';

export function formatCurrency(value: number, currency: AppCurrency = 'TRY') {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
