export function formatCurrency(value, currency = 'PKR') {
  const amount = Number(value || 0);
  return `${currency} ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 2 }).format(amount)}`;
}
