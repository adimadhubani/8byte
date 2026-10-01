// value null hai toh dash render karo
export function toRupees(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '—';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}

// + sign manually add kar rahe positive numbers ke liye
export function asPercent(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '—';
  }

  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(2)}%`;
}

export function gainLossClass(val: number | null | undefined): string {
  if (val === null || val === undefined || val === 0) {
    return 'text-slate-600';
  }
  return val > 0 ? 'text-green-600' : 'text-red-600';
}

export const badgeStyle = (val: number | null | undefined): string => {
  if (val === null || val === undefined || val === 0) {
    return 'bg-slate-100 text-slate-700 border-slate-200';
  }
  return val > 0
    ? 'bg-green-50 text-green-700 border-green-200'
    : 'bg-red-50 text-red-700 border-red-200';
};
