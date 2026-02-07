export const formatPercentage = (value: number, digits = 1): string => {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(digits)}%`;
};

export const formatCurrencyBRL = (value: number): string => {
  if (!Number.isFinite(value)) return 'R$ 0';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCompactBRL = (value: number): string => {
  if (!Number.isFinite(value)) return 'R$ 0';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};
