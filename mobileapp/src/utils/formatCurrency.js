export default function formatCurrency(value) {
  const amount = new Intl.NumberFormat('fr-TN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value || 0);

  return `${amount} دت`;
}
