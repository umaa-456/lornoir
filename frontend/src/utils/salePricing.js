export function getSalePrice(product, regularPrice) {
  const discount = Number(product?.activeSale?.discount);
  if (!Number.isFinite(discount) || discount <= 0) return Number(regularPrice);
  return Math.round(Number(regularPrice) * (1 - discount / 100) * 100) / 100;
}

export function isOnActiveSale(product) {
  return Number(product?.activeSale?.discount) > 0;
}
